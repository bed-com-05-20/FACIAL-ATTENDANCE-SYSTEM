import { Module } from '@nestjs/common';
import { FaceRecognitionService } from '../services/face-recognition.services';
import { FaceRecognitionController } from './face-recognition.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaceEntity } from 'src/Entities/face.entity';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { CameraModule } from 'src/camera/camera.module';
import { GatewayModule } from 'src/face-gateway/face-gateway.module';
import { ExamSessionEntity } from 'src/entity/examsession.entity';
import { AttendanceHistoryEntity } from 'src/entity/history.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      FaceEntity,
      ExamSessionEntity,
      AttendanceHistoryEntity]),
    AttendanceModule,
     CameraModule,
    GatewayModule
  ],

  providers: [FaceRecognitionService],
  controllers: [FaceRecognitionController],
})
export class FaceRecognitionModule {}
