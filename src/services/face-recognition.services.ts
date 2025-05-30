import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import * as faceapi from 'face-api.js';
import * as fs from 'fs';
import * as path from 'path';
import * as canvas from 'canvas';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaceEntity } from 'src/Entities/face.entity';
import { AttendanceService } from 'src/attendance/attendance.service';
import { FaceGateway } from 'src/FaceGateway/face_gateway';

// Monkey patch face-api.js to work with Node.js using canvas
faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas as any,
  Image: canvas.Image as any,
  ImageData: canvas.ImageData as any,
});

// Interface representing descriptor data to store
export interface FaceDescriptorData {
  descriptor: Float32Array;
  registrationNumber: string;
}

// Type for the result of face recognition
export type RecognitionResult =
  | { match: true; registrationNumber: string; distance: number; attendance: any }
  | { match: true; registrationNumber: string; distance: number; attendanceError: string }
  | { match: false; registrationNumber: null; distance: number };

@Injectable()
export class FaceRecognitionService implements OnModuleInit {
  private readonly logger = new Logger(FaceRecognitionService.name);

  // In-memory storage of all face descriptors from DB
  private descriptors: FaceDescriptorData[] = [];

  constructor(
    @InjectRepository(FaceEntity)
    private readonly faceRepository: Repository<FaceEntity>, // Database repository for face data
    private readonly attendanceService: AttendanceService,   // Attendance marking service
    private readonly faceGateway: FaceGateway                // WebSocket/event emitter gateway
  ) {}

  // Runs when the module initializes (loads models and DB descriptors)
  async onModuleInit(): Promise<void> {
    await this.loadModels();
    await this.loadDescriptorsFromDatabase();
  }

  // Load pre-trained face-api.js models from the filesystem
  private async loadModels(): Promise<void> {
    const modelPath = path.resolve(process.cwd(), 'models');
    await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    this.logger.log(`Face API models loaded from: ${modelPath}`);
  }

  // Detects faces in an image and returns descriptors
  async detectFace(imagePath: string): Promise<{ descriptor: Float32Array }[]> {
    const img = await canvas.loadImage(imagePath);
    const detections = await faceapi
      .detectAllFaces(img as any, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.6 }))
      .withFaceLandmarks()
      .withFaceDescriptors();

    this.logger.log(`Detected ${detections.length} face(s).`);
    this.faceGateway.emitEvent('face-detected', {
      count: detections.length,
      timestamp: new Date().toISOString(),
    });

    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath); // Clean up uploaded image
    return detections.map((d) => ({ descriptor: d.descriptor }));
  }

  // Save a new descriptor to the database 
  async saveDescriptor(data: FaceDescriptorData): Promise<void> {
    const entity = this.faceRepository.create({
      descriptor: JSON.stringify(Array.from(data.descriptor)),
      registrationNumber: data.registrationNumber,
    });

    await this.faceRepository.insert(entity); // Insert to prevent overwriting
    this.logger.log(`Descriptor saved for registrationNumber: ${data.registrationNumber}`);
    await this.loadDescriptorsFromDatabase(); // Reload in-memory list
  }

  // Load all face descriptors from database into memory
  async loadDescriptorsFromDatabase(): Promise<void> {
    const all = await this.faceRepository.find();
    this.descriptors = all.map((entry) => ({
      descriptor: new Float32Array(JSON.parse(entry.descriptor)),
      registrationNumber: entry.registrationNumber,
    }));
    this.logger.log(`Loaded ${this.descriptors.length} descriptors from DB`);
  }

  // Recognize user from given face descriptors and mark attendance
  async recognizeUser(detectedFaces: { descriptor: Float32Array }[]): Promise<RecognitionResult[]> {
    const threshold = 0.6;
    const results: RecognitionResult[] = [];
    const recognizedUsers = new Set<string>(); // Prevent multiple attendance

    for (const { descriptor } of detectedFaces) {
      const matches = this.descriptors
        .map((stored) => ({ stored, distance: faceapi.euclideanDistance(descriptor, stored.descriptor) }))
        .filter(({ distance }) => distance < threshold)
        .sort((a, b) => a.distance - b.distance); // Closest match first

      if (matches.length > 0) {
        const { stored, distance } = matches[0];
        if (!recognizedUsers.has(stored.registrationNumber)) {
          try {
            const attendance = await this.attendanceService.markAttendance(stored.registrationNumber);
            recognizedUsers.add(stored.registrationNumber);
            results.push({ match: true, registrationNumber: stored.registrationNumber, distance, attendance });
          } catch (error) {
            results.push({ match: true, registrationNumber: stored.registrationNumber, distance, attendanceError: error.message });
          }
        } else {
          results.push({ match: true, registrationNumber: stored.registrationNumber, distance, attendanceError: 'Attendance already marked' });
        }
      } else {
        // No match found within threshold
        this.logger.warn(`Face not recognized. Closest match distance: ${Math.min(...this.descriptors.map(d => faceapi.euclideanDistance(descriptor, d.descriptor))).toFixed(4)}`);
        results.push({ match: false, registrationNumber: null, distance: Number.MAX_VALUE });
      }
    }

    return results;
  }

  // Fetch all descriptors for a specific user (by registration number)
  async getDescriptorByRegistrationNumber(registrationNumber: string): Promise<FaceDescriptorData[] | null> {
    const entries = await this.faceRepository.find({ where: { registrationNumber } });
    if (!entries.length) return null;
    return entries.map(entry => ({
      descriptor: new Float32Array(JSON.parse(entry.descriptor)),
      registrationNumber: entry.registrationNumber,
    }));
  }

  // Fetch all descriptors from DB
  async getAllDescriptors(): Promise<any[]> {
    const all = await this.faceRepository.find();
    return all.map((face) => ({
      ...face,
      descriptor: JSON.parse(face.descriptor),
    }));
  }

  // Delete all stored descriptors (DB + in-memory)
  async deleteAllDescriptors(): Promise<void> {
    await this.faceRepository.clear();
    this.descriptors = [];
    this.logger.log('All descriptors deleted from DB and memory.');
  }


async deleteDescriptorById(id: string): Promise<boolean> {
  const result = await this.faceRepository.delete(id ); // UUID as string
  return !!result.affected && result.affected > 0;
}

}

