
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

faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas as any,
  Image: canvas.Image as any,
  ImageData: canvas.ImageData as any,
});

export interface FaceDescriptorData {
  descriptor: Float32Array;
  registrationNumber: string;
}

export type RecognitionResult =
  | { match: true; registrationNumber: string; distance: number; attendance: any }
  | { match: true; registrationNumber: string; distance: number; attendanceError: string }
  | { match: false; registrationNumber: null; distance: number };

@Injectable()
export class FaceRecognitionService implements OnModuleInit {
  private readonly logger = new Logger(FaceRecognitionService.name);
  private descriptors: FaceDescriptorData[] = [];

  constructor(
    @InjectRepository(FaceEntity)
    private readonly faceRepository: Repository<FaceEntity>,
    private readonly attendanceService: AttendanceService,
    private readonly faceGateway: FaceGateway,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.loadModels();
    await this.loadDescriptorsFromDatabase();
  }

  private async loadModels(): Promise<void> {
    const modelPath = path.resolve(process.cwd(), 'models');
    await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    this.logger.log(`Face API models loaded from: ${modelPath}`);
  }

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

    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    return detections.map((d) => ({ descriptor: d.descriptor }));
  }

  async saveDescriptor(data: FaceDescriptorData): Promise<void> {
    const entity = this.faceRepository.create({
      descriptor: JSON.stringify(Array.from(data.descriptor)),
      registrationNumber: data.registrationNumber,
    });

    await this.faceRepository.insert(entity);
    this.logger.log(`Descriptor saved for registrationNumber: ${data.registrationNumber}`);
    await this.loadDescriptorsFromDatabase();
  }

  async loadDescriptorsFromDatabase(): Promise<void> {
    const all = await this.faceRepository.find();
    this.descriptors = all.map((entry) => ({
      descriptor: new Float32Array(JSON.parse(entry.descriptor)),
      registrationNumber: entry.registrationNumber,
    }));
    this.logger.log(`Loaded ${this.descriptors.length} descriptors from DB`);
  }

  async recognizeUser(detectedFaces: { descriptor: Float32Array }[]): Promise<RecognitionResult[]> {
    const threshold = 0.6; // increased threshold for better recognition tolerance
    const results: RecognitionResult[] = [];
    const recognizedUsers = new Set<string>();

    for (const { descriptor } of detectedFaces) {
      const matches: { stored: FaceDescriptorData; distance: number }[] = this.descriptors
        .map((stored) => ({ stored, distance: faceapi.euclideanDistance(descriptor, stored.descriptor) }))
        .filter(({ distance }) => distance < threshold)
        .sort((a, b) => a.distance - b.distance);

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
        this.logger.warn(`Face not recognized. Closest match distance: ${Math.min(...this.descriptors.map(d => faceapi.euclideanDistance(descriptor, d.descriptor))).toFixed(4)}`);
        results.push({ match: false, registrationNumber: null, distance: Number.MAX_VALUE });
      }
    }

    return results;
  }

  async getDescriptorByRegistrationNumber(registrationNumber: string): Promise<FaceDescriptorData[] | null> {
    const entries = await this.faceRepository.find({ where: { registrationNumber } });
    if (!entries.length) return null;
    return entries.map(entry => ({
      descriptor: new Float32Array(JSON.parse(entry.descriptor)),
      registrationNumber: entry.registrationNumber,
    }));
  }

  async getAllDescriptors(): Promise<any[]> {
    const all = await this.faceRepository.find();
    return all.map((face) => ({
      ...face,
      descriptor: JSON.parse(face.descriptor),
    }));
  }

  async deleteAllDescriptors(): Promise<void> {
    await this.faceRepository.clear();
    this.descriptors = [];
    this.logger.log('All descriptors deleted from DB and memory.');
  }
}
