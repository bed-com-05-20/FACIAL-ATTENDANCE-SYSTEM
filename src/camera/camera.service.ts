// src/camera/camera.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class CameraService {
  private readonly logger = new Logger(CameraService.name);

  async captureImage(filename: string): Promise<string> {
    const scriptPath = path.resolve(__dirname, '..', '..', 'scripts', 'capture.py');
    const imageFolder = path.resolve(__dirname, '..', '..', 'images');
    const imagePath = path.join(imageFolder, filename);

    try {
      const command = `python "${scriptPath}" ${filename}`;
      this.logger.log(`Running command: ${command}`);
      await execAsync(command);
      this.logger.log(`Image captured at: ${imagePath}`);
      return imagePath;
    } catch (error) {
      this.logger.error('Camera capture failed', error);
      throw new Error('Failed to capture image');
    }
  }
}
