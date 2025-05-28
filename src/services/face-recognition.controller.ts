// src/controllers/face-recognition.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  InternalServerErrorException,
  Logger,
  Get,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { CameraService } from '../camera/camera.service';
import { FaceRecognitionService, RecognitionResult } from './face-recognition.services';

@Controller('face')
export class FaceRecognitionController {
  private readonly logger = new Logger(FaceRecognitionController.name);

  constructor(
    private readonly faceService: FaceRecognitionService,
    private readonly cameraService: CameraService,
  ) {}

  @Post('detect')
  @UseInterceptors(FileInterceptor('file'))
  async detectFace(
    @UploadedFile() file: Express.Multer.File,
    @Body('registrationNumber') registrationNumber: string,
  ) {
    if (!registrationNumber) {
      throw new InternalServerErrorException('Registration number is required.');
    }

    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });

    let tempPath: string | undefined;

    try {
      // Step 1: Save or capture image
      if (!file) {
        const filename = `${Date.now()}.jpg`;
        tempPath = await this.cameraService.captureImage(filename);
      } else {
        tempPath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);
        fs.writeFileSync(tempPath, file.buffer);
      }

      // Step 2: Detect all faces from image
      const detections = await this.faceService.detectFace(tempPath);
      const recognitionResults: RecognitionResult[] = [];

      for (const { descriptor } of detections) {
        // Step 3: Try to recognize
        const matches = await this.faceService.recognizeUser([{ descriptor }]);
        const match = matches[0];

        // Step 4: Match not found or match with wrong registration number
        if (!match.match || match.registrationNumber !== registrationNumber) {
          // Add this as new descriptor for the given registration number
          await this.faceService.saveDescriptor({
            descriptor,
            registrationNumber,
          });

          this.logger.log(`New descriptor added for registration number: ${registrationNumber}`);
          recognitionResults.push({
            match: true,
            registrationNumber,
            distance: 0,
            attendance: 'New descriptor saved',
          });
        } else {
          // Already matched successfully
          this.logger.log(`Face recognized: ${match.registrationNumber}`);
          recognitionResults.push(match);
        }
      }

      return recognitionResults;
    } catch (error) {
      this.logger.error('Face detection failed', error.stack || error.message);
      throw new InternalServerErrorException('Face detection failed.');
    } finally {
      if (tempPath && fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  @Delete('all')
  async deleteAllDescriptors() {
    try {
      await this.faceService.deleteAllDescriptors();
      return { message: 'All descriptors deleted successfully' };
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete all descriptors');
    }
  }

  @Get('all')
  async getAllDescriptors() {
    try {
      return await this.faceService.getAllDescriptors();
    } catch (error) {
      this.logger.error('Failed to fetch descriptors', error.stack || error.message);
      throw new InternalServerErrorException('Failed to fetch data.');
    }
  }
}
