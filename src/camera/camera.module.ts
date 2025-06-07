import { Module } from '@nestjs/common';
import { CameraService } from './camera.service';
import { CameraController } from 'src/services/camera.controller';

@Module({
  providers: [CameraService],
  exports:[CameraService],
  controllers: [CameraController]
})
export class CameraModule {}
