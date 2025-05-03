import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as faceapi from 'face-api.js';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as unzipper from 'unzipper';
import * as canvas from 'canvas';

faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas as any,
  Image: canvas.Image as any,
  ImageData: canvas.ImageData as any,
});

@Injectable()
export class FaceRecognitionService implements OnModuleInit {
  private readonly modelPath = path.join(__dirname, '..', 'models');
  private readonly modelURL = 'https://github.com/justadudewhohacks/face-api.js-models/archive/refs/heads/master.zip';
  private readonly logger = new Logger(FaceRecognitionService.name);

  private descriptors: {
    descriptor: Float32Array;
    name: string;
    userId: string | null;
  }[] = [];

  async onModuleInit() {
    await this.loadModels();
    this.logger.log(`Models loaded from: ${this.modelPath}`);
  }

  private async downloadAndExtractModels(retries = 3) {
    return new Promise<void>((resolve, reject) => {
      const zipPath = path.join(this.modelPath, 'models.zip');
      fs.mkdirSync(this.modelPath, { recursive: true });

      const file = fs.createWriteStream(zipPath);

      const download = (url: string) => {
        https.get(url, (response) => {
          if (response.statusCode === 302 && response.headers.location) {
            return download(response.headers.location);
          }

          if (response.statusCode !== 200) {
            if (retries > 0) {
              return this.downloadAndExtractModels(retries - 1);
            }
            return reject(new Error('Failed to download model.'));
          }

          response.pipe(file);
          file.on('finish', () => {
            file.close();
            fs.createReadStream(zipPath)
              .pipe(unzipper.Extract({ path: this.modelPath }))
              .on('close', () => {
                fs.unlinkSync(zipPath);
                resolve();
              })
              .on('error', reject);
          });
        }).on('error', reject);
      };

      download(this.modelURL);
    });
  }

  private async loadModels() {
    const resolvedPath = path.resolve(process.cwd(), 'models');

    await faceapi.nets.tinyFaceDetector.loadFromDisk(resolvedPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(resolvedPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(resolvedPath);

    this.logger.log('Face recognition models loaded.');
  }

  async detectFace(imagePath: string) {
    try {
      const img = await canvas.loadImage(imagePath);

      const detections = await faceapi
        .detectAllFaces(img as unknown as faceapi.TNetInput, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      fs.unlinkSync(imagePath);

      return detections.map(detection => ({
        detection,
        descriptor: detection.descriptor
      }));
    } catch (error) {
      this.logger.error('Error detecting face:', error);
      throw error;
    }
  }

  async saveDescriptor(data: {
    descriptor: Float32Array;
    name: string;
    userId: string | null;
  }) {
    this.descriptors.push(data);
    this.logger.log(`Descriptor saved for: ${data.name || 'Unnamed User'}`);
  }

  async recognizeUser(detectedFaces: { descriptor: Float32Array }[]) {
    const threshold = 0.5; // Euclidean distance threshold
    const results: {
      match: boolean;
      name: string;
      userId: string | null;
      distance: number;
    }[] = [];
  
    for (const { descriptor } of detectedFaces) {
      let bestMatch: {
        descriptor: Float32Array;
        name: string;
        userId: string | null;
      } | null = null;
  
      let bestDistance = Number.MAX_VALUE;
  
      for (const stored of this.descriptors) {
        const distance = faceapi.euclideanDistance(descriptor, stored.descriptor);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatch = stored;
        }
      }
  
      results.push(
        bestMatch && bestDistance < threshold
          ? {
              match: true,
              name: bestMatch.name,
              userId: bestMatch.userId,
              distance: bestDistance
            }
          : {
              match: false,
              name: 'new user',
              userId: null,
              distance: bestDistance
            }
      );
    }
  
    return results;
  }
  
}