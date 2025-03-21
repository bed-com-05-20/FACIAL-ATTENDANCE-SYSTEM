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
    await this.ensureModelsExist();
    await this.loadModels();
  }

  private async ensureModelsExist() {
    if (!fs.existsSync(this.modelPath)) {
      this.logger.log('Models not found. Downloading...');
      await this.downloadAndExtractModels();
    }
  }

  private async downloadAndExtractModels() {
    return new Promise<void>((resolve, reject) => {
      const zipPath = path.join(this.modelPath, 'models.zip');
      fs.mkdirSync(this.modelPath, { recursive: true });

      const file = fs.createWriteStream(zipPath);
      let fileSize = 0; // Initialize file size variable

      https.get(this.modelURL, (response) => {
        if (response.statusCode !== undefined) {
          this.logger.log(`Response status: ${response.statusCode}`);
          if (response.statusCode >= 300 && response.statusCode < 400) {
            const redirectUrl = response.headers.location;
            if (redirectUrl) {
              this.logger.log(`Redirecting to: ${redirectUrl}`);
              https.get(redirectUrl, (redirectResponse) => {
                redirectResponse.pipe(file);
                redirectResponse.on('end', () => {
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
              }).on('error', reject);
              return;
            }
          }
        } else {
          this.logger.error('Response status is undefined. Cannot proceed with download.');
          return reject(new Error('Response status is undefined.'));
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
      }).on('error', reject);
    });
  }

  private async loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(this.modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(this.modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(this.modelPath);
    this.logger.log('Face recognition models loaded successfully.');
  }

  async detectFace(imageBuffer: Buffer) {
    try {
      const img = await canvas.loadImage(imageBuffer);
      const detections = await faceapi.detectAllFaces(img as unknown as HTMLImageElement)

        .withFaceLandmarks()
        .withFaceDescriptors();

      return detections;
    } catch (error) {
      this.logger.error('Error detecting face:', error);
      throw error;
    }
  }
}
