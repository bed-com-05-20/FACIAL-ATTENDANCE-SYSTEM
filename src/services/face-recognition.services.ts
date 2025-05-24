// src/services/face-recognition.service.ts
import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import * as faceapi from 'face-api.js';
import * as fs from 'fs';
import * as path from 'path';
import * as canvas from 'canvas';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaceEntity } from 'src/Entities/face.entity';
import { AttendanceService } from 'src/attendance/attendance.service';

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
  | {
      match: true;
      registrationNumber: string;
      distance: number;
      attendance: any;
    }
  | {
      match: true;
      registrationNumber: string;
      distance: number;
      attendanceError: string;
    }
  | {
      match: false;
      registrationNumber: null;
      distance: number;
    };

@Injectable()
export class FaceRecognitionService implements OnModuleInit {
  private readonly logger = new Logger(FaceRecognitionService.name);
  private descriptors: FaceDescriptorData[] = [];

  constructor(
    @InjectRepository(FaceEntity)
    private readonly faceRepository: Repository<FaceEntity>,
    private readonly attendanceService: AttendanceService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.loadModels();
    await this.loadDescriptorsFromDatabase();
    this.logger.log('Models loaded and descriptors initialized.');
  }

  private async loadModels(): Promise<void> {
    const modelPath = path.resolve(process.cwd(), 'models');
    await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    this.logger.log(`Face API models loaded from: ${modelPath}`);
  }

  async detectFace(imagePath: string): Promise<{ descriptor: Float32Array }[]> {
    let img;
    try {
      this.logger.log(`Loading image from path: ${imagePath}`);
      img = await canvas.loadImage(imagePath);
    } catch (error) {
      this.logger.error(`Failed to load image: ${imagePath}`);
      throw new Error(`Cannot load image from path: ${imagePath}`);
    }

    try {
      const detections = await faceapi
        .detectAllFaces(
          img as unknown as faceapi.TNetInput,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.6 }),
        )
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (!detections.length) {
        this.logger.warn('No faces detected.');
      } else {
        this.logger.log(`Detected ${detections.length} face(s).`);
      }

      return detections.map((d) => ({
        descriptor: d.descriptor,
      }));
    } catch (error) {
      this.logger.error('Error during face detection:', error.message);
      throw error;
    } finally {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        this.logger.log(`Deleted temp image: ${imagePath}`);
      }
    }
  }

  async ensureUniqueRegistration(registrationNumber: string): Promise<void> {
    const existing = await this.faceRepository.findOne({ where: { registrationNumber } });
    if (existing) {
      throw new BadRequestException(`Registration number ${registrationNumber} already exists.`);
    }
  }

  async saveDescriptor(data: FaceDescriptorData): Promise<void> {
    const descriptorArray = Array.from(data.descriptor);
    if (descriptorArray.length !== 128) {
      this.logger.error(`Invalid descriptor length: ${descriptorArray.length}`);
      throw new Error('Descriptor must be a 128-length Float32Array');
    }

    const entity = this.faceRepository.create({
      descriptor: JSON.stringify(descriptorArray),
      registrationNumber: data.registrationNumber,
    });

    await this.faceRepository.save(entity);
    this.logger.log(`Descriptor saved for registrationNumber: ${data.registrationNumber}`);
    await this.loadDescriptorsFromDatabase(); // Refresh cache
  }

  async loadDescriptorsFromDatabase(): Promise<void> {
    const all = await this.faceRepository.find();
    this.descriptors = all.map((entry) => {
      const array = JSON.parse(entry.descriptor);
      return {
        descriptor: new Float32Array(array),
        registrationNumber: entry.registrationNumber,
      };
    });
    this.logger.log(`Loaded ${this.descriptors.length} descriptors from DB`);
  }

  async recognizeUser(detectedFaces: { descriptor: Float32Array }[]): Promise<RecognitionResult[]> {
    const threshold = 0.5;
    const results: RecognitionResult[] = [];
    const recognizedUsers = new Set<string>();

    for (const { descriptor } of detectedFaces) {
      let bestMatch: FaceDescriptorData | null = null;
      let bestDistance = Number.MAX_VALUE;

      for (const stored of this.descriptors) {
        const distance = faceapi.euclideanDistance(descriptor, stored.descriptor);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatch = stored;
        }
      }

      if (bestMatch && bestDistance < threshold) {
        if (!recognizedUsers.has(bestMatch.registrationNumber)) {
          try {
            const attendance = await this.attendanceService.markAttendance(bestMatch.registrationNumber);
            recognizedUsers.add(bestMatch.registrationNumber);
            results.push({
              match: true,
              registrationNumber: bestMatch.registrationNumber,
              distance: bestDistance,
              attendance,
            });
          } catch (error) {
            results.push({
              match: true,
              registrationNumber: bestMatch.registrationNumber,
              distance: bestDistance,
              attendanceError: error.message,
            });
          }
        } else {
          results.push({
            match: true,
            registrationNumber: bestMatch.registrationNumber,
            distance: bestDistance,
            attendanceError: 'Attendance already marked for this registration number',
          });
        }
      } else {
        results.push({
          match: false,
          registrationNumber: null,
          distance: bestDistance,
        });
      }
    }

    return results;
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
