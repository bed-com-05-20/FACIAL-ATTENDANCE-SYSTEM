// import { Injectable, OnModuleInit } from '@nestjs/common';
// import * as faceapi from 'face-api.js';
// import * as path from 'path';
// import * as canvas from 'canvas'; // Import the canvas library

// const { Canvas, Image, ImageData, loadImage } = canvas;

// // Monkey-patch face-api.js to use node-canvas, casting types to avoid TypeScript errors
// faceapi.env.monkeyPatch({
//   Canvas: Canvas as unknown as { new (): HTMLCanvasElement; prototype: HTMLCanvasElement },
//   Image: Image as unknown as { new (): HTMLImageElement; prototype: HTMLImageElement },
//   ImageData: ImageData as unknown as { 
//     new (sw: number, sh: number, settings?: ImageDataSettings): ImageData; 
//     new (data: Uint8ClampedArray, sw: number, sh?: number, settings?: ImageDataSettings): ImageData; 
//     prototype: ImageData; 
//   },
// });

// @Injectable()
// export class FaceRecognitionService implements OnModuleInit {
//   async onModuleInit() {
//     // Load models from the models directory
//     const modelPath = path.join(__dirname, '..', 'models');
//     await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
//     await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
//     await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
//   }

//   async detectFace(imagePath: string) {
//     try {
//       // Load image using canvas' loadImage function
//       const img = await loadImage(imagePath);

//       // Perform face detection
//       const detections = await faceapi.detectAllFaces(img as any) 
//         .withFaceLandmarks()
//         .withFaceDescriptors();

//       return detections;
//     } catch (error) {
//       console.error('Error detecting face:', error);
//       throw new Error('Face detection failed.');
//     }
//   }
// }
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
      https.get(this.modelURL, (response) => {
        response.pipe(file);
        file.on('finish', async () => {
          file.close();
          this.logger.log('Download complete. Extracting...');
          fs.createReadStream(zipPath)
            .pipe(unzipper.Extract({ path: this.modelPath }))
            .on('close', () => {
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
      const detections = await faceapi.detectAllFaces('img')
        .withFaceLandmarks()
        .withFaceDescriptors();

      return detections;
    } catch (error) {
      this.logger.error('Error detecting face:', error);
      throw error;
    }
  }
}
