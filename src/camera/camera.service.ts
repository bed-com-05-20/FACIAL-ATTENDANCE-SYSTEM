import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';

@Injectable()
export class CameraService {
  private readonly logger = new Logger(CameraService.name);

  // Base URL of your Flask server (no endpoint or query here)
  private readonly piBaseUrl = 'https://8f49-102-70-93-108.ngrok-free.app';

  
    //Capture images from the Flask Pi server.
   
  async captureImage(filename: string): Promise<string> {
    const imageDir = path.join(process.cwd(), 'images');
    const savePath = path.join(imageDir, filename);

    try {
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }

      const captureUrl = `${this.piBaseUrl}/capture`; // Proper URL

      this.logger.log(`Requesting image from: ${captureUrl}`);

      const response = await axios.get(captureUrl, {
        responseType: 'stream',
      });

      const writer = fs.createWriteStream(savePath);
      response.data.pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      this.logger.log(`Image saved at: ${savePath}`);
      return savePath;
    } catch (error) {
      this.logger.error('Failed to capture image:', error.message);
      throw new Error('Image capture failed');
    }
  }

  
    //Start a video or image capture session for a duration in seconds.
   
  async startTimedCapture(duration: number): Promise<void> {
    try {
      const startUrl = `${this.piBaseUrl}/start-capture?duration=${duration}`;

      this.logger.log(`Starting timed capture via: ${startUrl}`);

      await axios.get(startUrl);

      this.logger.log(`Timed capture started successfully`);
    } catch (error) {
      this.logger.error('Failed to start timed capture:', error.message);
      throw new Error('Timed capture failed');
    }
  }
}




