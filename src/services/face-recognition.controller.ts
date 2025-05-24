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
import { CameraService } from '../camera/camera.service'; // import camera service
import { FaceRecognitionService, RecognitionResult } from './face-recognition.services';

@Controller('face')
export class FaceRecognitionController {
  private readonly logger = new Logger(FaceRecognitionController.name);

  constructor(
    private readonly faceService: FaceRecognitionService,
    private readonly cameraService: CameraService, //  inject camera service
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
      if (!file) {
        const filename = `${Date.now()}.jpg`;
        tempPath = await this.cameraService.captureImage(filename);
        this.logger.log(`Captured image using Pi camera: ${tempPath}`);
      } else {
        tempPath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);
        fs.writeFileSync(tempPath, file.buffer);
        this.logger.log(`Image saved to ${tempPath}`);
      }
  
      const detections = await this.faceService.detectFace(tempPath);
      const recognitionResults: RecognitionResult[] = [];
  
      for (const { descriptor } of detections) {
        const matches = await this.faceService.recognizeUser([{ descriptor }]);
        const match = matches[0];
  
        if (!match.match) {
          await this.faceService.saveDescriptor({
            descriptor,
            registrationNumber,
          });
          this.logger.log(`New face saved for registration number: ${registrationNumber}`);
        } else {
          this.logger.log(`Face recognized with registration number: ${match.registrationNumber}`);
        }
  
        recognitionResults.push(match);
      }
  
      return recognitionResults;
    } catch (error) {
      this.logger.error('Face detection failed', error.stack || error.message);
      throw new InternalServerErrorException('Face detection failed.');
    } finally {
      if (tempPath && fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
        this.logger.log(`Deleted temp image: ${tempPath}`);
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