import * as faceapi from '@vladmandic/face-api';
import * as canvas from 'canvas';

const { Canvas, Image, ImageData } = canvas;

faceapi.env.monkeyPatch({
  Canvas: Canvas as unknown as typeof HTMLCanvasElement,
  Image: Image as unknown as typeof HTMLImageElement,
  ImageData: ImageData as unknown as typeof globalThis.ImageData,
});


export class UsersService {
  async registerUser(name: string, imagePath: string) {
    const img = await canvas.loadImage(imagePath);

    const detection = await faceapi
      .detectSingleFace(img as unknown as faceapi.TNetInput)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      throw new Error('No face detected!');
    }

    const faceEmbedding = detection.descriptor; // this is a Float32Array

    // Store user with name + embedding in database
    return {
      name,
      faceEmbedding: Array.from(faceEmbedding), // Save it as JSON or Buffer
    };
  }
}
