import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';

@Injectable()
export class CameraService {
  private readonly logger = new Logger(CameraService.name);

  // Use your actual Raspberry Pi IP and correct port
  private readonly piCameraUrl = 'http://192.168.43.75:5000/capture'; 

  async captureImage(filename: string): Promise<string> {
    const imageDir = path.join(process.cwd(), 'images');
    const savePath = path.join(imageDir, filename);

    try {
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }

      this.logger.log(`Requesting image from Raspberry Pi at ${this.piCameraUrl}`);
      const response = await axios.get(this.piCameraUrl, { responseType: 'stream' });

      const writer = fs.createWriteStream(savePath);
      response.data.pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      this.logger.log(`Image saved at: ${savePath}`);
      return savePath;
    } catch (error) {
      this.logger.error('Failed to fetch image from Raspberry Pi:', error.message);
      throw new Error('Image capture failed');
    }
  }
}
