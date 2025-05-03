import { Module } from '@nestjs/common';
import { FaceRecognitionService } from '../services/face-recognition.services';
import { FaceRecognitionController } from './face-recognition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaceEntity } from 'src/Entities/face.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FaceEntity])
  ],

  providers: [FaceRecognitionService],
  controllers: [FaceRecognitionController],
})
export class FaceRecognitionModule {}
