import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as faceapi from 'face-api.js';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as unzipper from 'unzipper';
import * as canvas from 'canvas';

faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas as any,  // Cast to `any` to avoid type conflicts
  Image: canvas.Image as any,
  ImageData: canvas.ImageData as any
});

@Injectable()
export class FaceRecognitionService implements OnModuleInit {
  private readonly modelPath = path.join(__dirname, '..', 'models');
  private readonly modelURL = 'https://github.com/justadudewhohacks/face-api.js-models/archive/refs/heads/master.zip';
  private readonly logger = new Logger(FaceRecognitionService.name);

  async onModuleInit() {
    //await this.ensureModelsExist();
    await this.loadModels();
    this.logger.log(`Loading models from: ${this.modelPath}`);

  }

  private async ensureModelsExist() {
    if (!fs.existsSync(this.modelPath)) {
      this.logger.log('Models not found. Downloading...');
      await this.downloadAndExtractModels();
    }
  }

  private async downloadAndExtractModels(retries: number = 3) {
    return new Promise<void>((resolve, reject) => {
      const zipPath = path.join(this.modelPath, 'models.zip');
      fs.mkdirSync(this.modelPath, { recursive: true });

      const file = fs.createWriteStream(zipPath);
      let fileSize = 0; // Initialize file size variable

      const download = (url: string) => {
        https.get(url, (response) => {
          if (response.statusCode === 302) {
            const redirectUrl = response.headers.location;
            if (redirectUrl) {
              this.logger.log(`Redirecting to: ${redirectUrl}`);
              return download(redirectUrl); // Follow the redirect
            }
          }

          if (response.statusCode !== 200) {
            this.logger.error(`Failed to download model: ${response.statusCode}`);
            if (retries > 0) {
              this.logger.log(`Retrying download... (${3 - retries + 1})`);
              return this.downloadAndExtractModels(retries - 1);
            } else {
              return reject(new Error('Failed to download model after multiple attempts.'));
            }
          }

          response.pipe(file);
          file.on('finish', async () => {
            file.close();
            this.logger.log('Download complete. Extracting...');
            fs.createReadStream(zipPath)
              .pipe(unzipper.Extract({ path: this.modelPath }))
              .on('close', async () => {
                // Check if the file size is greater than 0 before extraction
                fileSize = fs.statSync(zipPath).size;
                if (fileSize === 0) {
                  this.logger.error('Downloaded file is empty. Extraction aborted.');
                  return reject(new Error('Downloaded file is empty.'));
                }

                fs.unlinkSync(zipPath);
                this.logger.log('Model extraction complete.');
                resolve();
              })
              .on('error', reject);
          });
        }).on('error', (err) => {
          if (retries > 0) {
            this.logger.warn(`Download failed, retrying... (${retries} attempts left)`);
            download(url);
            retries--;
          } else {
            reject(err);
          }
        });
      };

      download(this.modelURL); 
    });
  }

  private async loadModels() {
    const resolvedPath = path.resolve(process.cwd(), 'models');

    //const resolvedPath = path.resolve(__dirname, '..', 'models');
    this.logger.log(`Loading models from: ${resolvedPath}`);
  
    await faceapi.nets.tinyFaceDetector.loadFromDisk(resolvedPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(resolvedPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(resolvedPath);
  
    this.logger.log('Face recognition models loaded successfully.');
  }
  
  
  async detectFace(imageBuffer: Buffer) {
    try {
      const img = await canvas.loadImage(imageBuffer);
  
      const detections = await faceapi.detectAllFaces(
        img as unknown as HTMLImageElement,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 416, 
          scoreThreshold: 0.5
        })
      )
      .withFaceLandmarks()
      .withFaceDescriptors();
  
      return detections;
    } catch (error) {
      this.logger.error('Error detecting face:', error);
      throw error;
    }
  }
  
}
