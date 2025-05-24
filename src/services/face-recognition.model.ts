import { Module } from '@nestjs/common';
import { FaceRecognitionService } from '../services/face-recognition.services';
import { FaceRecognitionController } from './face-recognition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaceEntity } from 'src/Entities/face.entity';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { CameraModule } from 'src/camera/camera.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FaceEntity]),
    AttendanceModule,
     CameraModule
  ],

  providers: [FaceRecognitionService],
  controllers: [FaceRecognitionController],
})
export class FaceRecognitionModule {}
