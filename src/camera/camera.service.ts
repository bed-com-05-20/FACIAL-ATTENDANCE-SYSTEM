import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';

@Injectable()
export class CameraService {
  private readonly logger = new Logger(CameraService.name);

  // Base URL of your Flask server (no endpoint or query here)
  private readonly piBaseUrl = 'http://192.168.43.75:5000';

  
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




// import { Injectable, Logger } from '@nestjs/common';
// import axios from 'axios';
// import * as fs from 'fs';
// import * as path from 'path';

// @Injectable()
// export class CameraService {
//   private readonly logger = new Logger(CameraService.name);
//   private readonly piUrl = 'http://192.168.43.75:5000';

//   /**
//    * Capture a single image from the Pi and save locally.
//    */
//   async captureImage(filename: string): Promise<string> {
//     const imageDir = path.join(process.cwd(), 'images');
//     const localPath = path.join(imageDir, filename);

//     try {
//       if (!fs.existsSync(imageDir)) {
//         fs.mkdirSync(imageDir, { recursive: true });
//       }

//       const captureUrl = `${this.piUrl}/capture?filename=${encodeURIComponent(filename)}`;
//       this.logger.log(`Requesting single image from: ${captureUrl}`);

//       const response = await axios.get(captureUrl, { responseType: 'stream' });
//       const writer = fs.createWriteStream(localPath);
//       response.data.pipe(writer);

//       await new Promise<void>((resolve, reject) => {
//         writer.on('finish', resolve);
//         writer.on('error', reject);
//       });

//       this.logger.log(`Image saved locally at: ${localPath}`);
//       return localPath;
//     } catch (error) {
//       this.logger.error('Single image capture failed:', error.message);
//       throw new Error('Image capture from Pi failed');
//     }
//   }

//   /**
//    * Start capture for a duration, then download all images.
//    */
//   async startTimedCapture(duration: number): Promise<string[]> {
//     const imageDir = path.join(process.cwd(), 'images');

//     if (!fs.existsSync(imageDir)) {
//       fs.mkdirSync(imageDir, { recursive: true });
//     }

//     const startUrl = `${this.piUrl}/start-capture?duration=${duration}`;
//     this.logger.log(`Starting timed capture from: ${startUrl}`);

//     try {
//       await axios.get(startUrl);
//       await new Promise((resolve) => setTimeout(resolve, (duration + 1) * 1000));

//       const listUrl = `${this.piUrl}/list-images`;
//       const { data: imageNames } = await axios.get<string[]>(listUrl);
//       const downloaded: string[] = [];

//       for (const filename of imageNames) {
//         const imageUrl = `${this.piUrl}/images/${filename}`;
//         const localPath = path.join(imageDir, filename);
//         this.logger.log(`Downloading image: ${filename}`);

//         const response = await axios.get(imageUrl, { responseType: 'stream' });
//         const writer = fs.createWriteStream(localPath);
//         response.data.pipe(writer);

//         await new Promise<void>((resolve, reject) => {
//           writer.on('finish', resolve);
//           writer.on('error', reject);
//         });

//         downloaded.push(localPath);
//       }

//       this.logger.log(`Downloaded ${downloaded.length} images.`);
//       return downloaded;
//     } catch (error) {
//       this.logger.error('Timed capture failed:', error.message);
//       throw new Error('Timed capture or image download failed');
//     }
//   }

//   /**
//    * Process multiple uploaded image files one-by-one.
//    * Replace the mock processing logic with your real image recognition logic.
//    */
//   async processUploadedImages(files: Express.Multer.File[]): Promise<any[]> {
//     const results: any[] = [];

//     for (const file of files) {
//       const imagePath = file.path;
//       this.logger.log(`Processing uploaded image: ${imagePath}`);

//       try {
//         // TODO: Replace this mock result with actual recognition logic.
//         const recognitionResult = {
//           filename: file.filename,
//           status: 'processed',
//           message: 'Image processed successfully',
//         };

//         results.push(recognitionResult);
//       } catch (error) {
//         this.logger.error(`Failed to process image ${file.filename}: ${error.message}`);
//         results.push({
//           filename: file.filename,
//           status: 'error',
//           message: error.message,
//         });
//       }
//     }

//     return results;
//   }
// }
