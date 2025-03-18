import { Injectable, OnModuleInit } from '@nestjs/common';
import * as faceapi from 'face-api.js';
import * as path from 'path';
import * as canvas from 'canvas'; // Import the canvas library

const { Canvas, Image, ImageData, loadImage } = canvas;

// Monkey-patch face-api.js to use node-canvas, casting types to avoid TypeScript errors
faceapi.env.monkeyPatch({
  Canvas: Canvas as unknown as { new (): HTMLCanvasElement; prototype: HTMLCanvasElement },
  Image: Image as unknown as { new (): HTMLImageElement; prototype: HTMLImageElement },
  ImageData: ImageData as unknown as { 
    new (sw: number, sh: number, settings?: ImageDataSettings): ImageData; 
    new (data: Uint8ClampedArray, sw: number, sh?: number, settings?: ImageDataSettings): ImageData; 
    prototype: ImageData; 
  },
});

@Injectable()
export class FaceRecognitionService implements OnModuleInit {
  async onModuleInit() {
    // Load models from the models directory
    const modelPath = path.join(__dirname, '..', 'models');
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  }

  async detectFace(imagePath: string) {
    try {
      // Load image using canvas' loadImage function
      const img = await loadImage(imagePath);

      // Perform face detection
      const detections = await faceapi.detectAllFaces(img as any) // Cast img to `any` to avoid TypeScript issues
        .withFaceLandmarks()
        .withFaceDescriptors();

      return detections;
    } catch (error) {
      console.error('Error detecting face:', error);
      throw new Error('Face detection failed.');
    }
  }
}
