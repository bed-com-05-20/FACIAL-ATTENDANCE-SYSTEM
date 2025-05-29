import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';

@Injectable()
export class CameraService {
  // Logger instance for logging info and errors
  private readonly logger = new Logger(CameraService.name);

  // URL of the Raspberry Pi Flask server endpoint for capturing an image
  private readonly piCameraUrl = 'http://192.168.43.75:5000/capture';

  /**
   * Captures an image from the Raspberry Pi camera server and saves it locally.
   * @param filename The name to give the saved image file.
   * @returns The full path to the saved image.
   */
  async captureImage(filename: string): Promise<string> {
    // Define the directory to store images
    const imageDir = path.join(process.cwd(), 'images');

    // Full path for the image to be saved
    const savePath = path.join(imageDir, filename);

    try {
      // Create the directory if it doesn't exist
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }

      this.logger.log(`Requesting image from Raspberry Pi at ${this.piCameraUrl}`);

      // Make an HTTP GET request to the Pi to fetch the image stream
      const response = await axios.get(this.piCameraUrl, { responseType: 'stream' });

      // Create a write stream to save the image to disk
      const writer = fs.createWriteStream(savePath);
      response.data.pipe(writer); // Pipe the incoming image data into the file

      // Return a Promise that resolves when the file is completely written
      await new Promise<void>((resolve, reject) => {
        writer.on('finish', resolve); // Resolve on successful write
        writer.on('error', reject);   // Reject if there's a write error
      });

      this.logger.log(`Image saved at: ${savePath}`);
      return savePath;
    } catch (error) {
      // Log the error and throw a generic error to the calling function
      this.logger.error('Failed to fetch image from Raspberry Pi:', error.message);
      throw new Error('Image capture failed');
    }
  }
}
