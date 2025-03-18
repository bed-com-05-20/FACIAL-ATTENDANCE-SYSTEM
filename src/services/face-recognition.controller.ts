import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FaceRecognitionService } from '../services/face-recognition.services';
import { Express } from 'express'; 

@Controller('face-recognition')
export class FaceRecognitionController {
  constructor(private readonly faceRecognitionService: FaceRecognitionService) {}

  @Post('detect')
  @UseInterceptors(FileInterceptor('file'))
  async detect(@UploadedFile() file: Express.Multer.File) { 
    const detections = await this.faceRecognitionService.detectFace(file.path);
    return { detections };
  }
}
