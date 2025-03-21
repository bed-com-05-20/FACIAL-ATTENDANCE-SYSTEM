import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FaceRecognitionService } from '../services/face-recognition.services';
import { Multer } from 'multer';


@Controller('face-recognition')
export class FaceRecognitionController {
  constructor(private readonly faceRecognitionService: FaceRecognitionService) {}

  @Post('detect')
  @UseInterceptors(FileInterceptor('file'))
  async detect(@UploadedFile() file: Multer.File)
  { 
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Pass the file buffer instead of path
    const detections = await this.faceRecognitionService.detectFace(file.buffer);
    
    return { detections };
  }
}
