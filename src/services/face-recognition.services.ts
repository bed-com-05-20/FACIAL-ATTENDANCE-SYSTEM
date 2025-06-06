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

// Monkey patching face-api.js for Node.js to work with canvas
faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas as any,
  Image: canvas.Image as any,
  ImageData: canvas.ImageData as any,
});

// Interface for representing a saved face descriptor with registration number
export interface FaceDescriptorData {
  descriptor: Float32Array;
  registrationNumber: string;
}

// Type definition for the result of a face recognition attempt
export type RecognitionResult =
  | { match: true; registrationNumber: string; distance: number; attendance: any }
  | { match: true; registrationNumber: string; distance: number; attendanceError: string }
  | { match: false; registrationNumber: null; distance: number };

@Injectable()
export class FaceRecognitionService implements OnModuleInit {
  private readonly logger = new Logger(FaceRecognitionService.name);

  // In-memory cache for loaded face descriptors
  private descriptors: FaceDescriptorData[] = [];

  constructor(
    @InjectRepository(FaceEntity)
    private readonly faceRepository: Repository<FaceEntity>, // Repository to access face descriptor entities
    private readonly attendanceService: AttendanceService,   // Service to mark attendance
    private readonly faceGateway: FaceGateway                // Gateway to emit events via WebSocket
  ) {}

  // Called when the module initializes - loads models and DB descriptors
  async onModuleInit(): Promise<void> {
    await this.loadModels();
    await this.loadDescriptorsFromDatabase();
  }

  // Load face-api.js models from disk
  private async loadModels(): Promise<void> {
    const modelPath = path.resolve(process.cwd(), 'models');
    await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    this.logger.log(`Face API models loaded from: ${modelPath}`);
  }

  // Detect faces in an image and return their descriptors
  async detectFace(imagePath: string): Promise<{ descriptor: Float32Array }[]> {
    const img = await canvas.loadImage(imagePath);

    // Run face detection with landmarks and descriptor extraction
    const detections = await faceapi
      .detectAllFaces(img as any, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.6 }))
      .withFaceLandmarks()
      .withFaceDescriptors();

    this.logger.log(`Detected ${detections.length} face(s).`);

    // Emit event via WebSocket with face detection count
    this.faceGateway.emitEvent('face-detected', {
      count: detections.length,
      timestamp: new Date().toISOString(),
    });

    // Delete the temporary image file
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    // Return descriptors
    return detections.map((d) => ({ descriptor: d.descriptor }));
  }

  // Save a new face descriptor to the database
  async saveDescriptor(data: FaceDescriptorData): Promise<void> {
    const entity = this.faceRepository.create({
      descriptor: JSON.stringify(Array.from(data.descriptor)), // Convert descriptor to string for storage
      registrationNumber: data.registrationNumber,
    });

    await this.faceRepository.insert(entity); // Insert new descriptor
    this.logger.log(`Descriptor saved for registrationNumber: ${data.registrationNumber}`);

    // Reload descriptors into memory
    await this.loadDescriptorsFromDatabase();
  }

  // Load all face descriptors from the database into memory
  async loadDescriptorsFromDatabase(): Promise<void> {
    const all = await this.faceRepository.find();

    // Convert descriptor strings back to Float32Array
    this.descriptors = all.map((entry) => ({
      descriptor: new Float32Array(JSON.parse(entry.descriptor)),
      registrationNumber: entry.registrationNumber,
    }));

    this.logger.log(`Loaded ${this.descriptors.length} descriptors from DB`);
  }

  // Recognize users from a list of detected face descriptors
  async recognizeUser(detectedFaces: { descriptor: Float32Array }[]): Promise<RecognitionResult[]> {
    const threshold = 0.6; // Threshold for face match
    const results: RecognitionResult[] = [];
    const recognizedUsers = new Set<string>(); // Prevent duplicate attendance marking

    for (const { descriptor } of detectedFaces) {
      // Compare detected descriptor with stored descriptors
      const matches = this.descriptors
        .map((stored) => ({
          stored,
          distance: faceapi.euclideanDistance(descriptor, stored.descriptor),
        }))
        .filter(({ distance }) => distance < threshold)
        .sort((a, b) => a.distance - b.distance); // Closest match first

      if (matches.length > 0) {
        const { stored, distance } = matches[0];

        if (!recognizedUsers.has(stored.registrationNumber)) {
          try {
            // Mark attendance if not already recognized in this session
            const attendance = await this.attendanceService.markAttendance(stored.registrationNumber);
            recognizedUsers.add(stored.registrationNumber);

            results.push({ match: true, registrationNumber: stored.registrationNumber, distance, attendance });
          } catch (error) {
            // Handle attendance marking failure
            results.push({
              match: true,
              registrationNumber: stored.registrationNumber,
              distance,
              attendanceError: error.message,
            });
          }
        } else {
          // Already marked in this request
          results.push({
            match: true,
            registrationNumber: stored.registrationNumber,
            distance,
            attendanceError: 'Attendance already marked',
          });
        }
      } else {
        // No matches found
        const closest = this.descriptors.length
          ? Math.min(...this.descriptors.map((d) => faceapi.euclideanDistance(descriptor, d.descriptor)))
          : 'N/A';

        this.logger.warn(`Face not recognized. Closest match distance: ${closest}`);
        results.push({ match: false, registrationNumber: null, distance: Number.MAX_VALUE });
      }
    }

    return results;
  }

  // Get all descriptors for a specific registration number
  async getDescriptorByRegistrationNumber(registrationNumber: string): Promise<FaceDescriptorData[] | null> {
    const entries = await this.faceRepository.find({ where: { registrationNumber } });

    // Return null if none found
    if (!entries.length) return null;

    // Convert to typed descriptors
    return entries.map((entry) => ({
      descriptor: new Float32Array(JSON.parse(entry.descriptor)),
      registrationNumber: entry.registrationNumber,
    }));
  }

  // Return all face descriptors from the database
  async getAllDescriptors(): Promise<any[]> {
    const all = await this.faceRepository.find();

    // Convert descriptor strings back to arrays
    return all.map((face) => ({
      ...face,
      descriptor: JSON.parse(face.descriptor),
    }));
  }

  // Delete all descriptors from database and memory
  async deleteAllDescriptors(): Promise<void> {
    await this.faceRepository.clear(); // Remove from DB
    this.descriptors = []; // Clear in-memory
    this.logger.log('All descriptors deleted from DB and memory.');
  }

  // Delete a specific face descriptor by its ID
  async deleteDescriptorById(id: string): Promise<boolean> {
    const result = await this.faceRepository.delete(id); // Remove by ID
    return !!result.affected && result.affected > 0;
  }
}
