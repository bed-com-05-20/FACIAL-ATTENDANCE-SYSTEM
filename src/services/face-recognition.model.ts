import { Module } from '@nestjs/common';
import { FaceRecognitionService } from '../services/face-recognition.services';
import { FaceRecognitionController } from './face-recognition.controller';

@Module({
  providers: [FaceRecognitionService],
  controllers: [FaceRecognitionController],
})
export class FaceRecognitionModule {}
