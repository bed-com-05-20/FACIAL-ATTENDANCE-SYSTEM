import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceModule } from './attendance/attendance.module';
import { FaceRecognitionModule } from './services/face-recognition.model'; // Make sure this is correctly named and points to a `.module.ts` file

import { Students } from './attendance/students.entity';
import { FaceEntity } from './Entities/face.entity';
import { CameraModule } from './camera/camera.module';
import { FaceGateway } from './FaceGateway/face_gateway';
import { GatewayModule } from './face-gateway/face-gateway.module';

@Module({
  imports: [
    MulterModule.register({ dest: './uploads' }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'dpg-d0rj9vbipnbc73b9v590-a.oregon-postgres.render.com',
      port: 5432,
      username: 'root',
      password: 'sdA2unoaD7e9Sq6sErMNY3JchIZQIkVN',
      database: 'attendance_04gg',
        ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
      entities: [Students,FaceEntity],
      synchronize: false,
    }),
    AttendanceModule,
    FaceRecognitionModule,
    CameraModule,
    GatewayModule, // This module should handle the controller/service
  ],
  controllers: [],
  providers: [FaceGateway],
  
  
  // controllers: [AppController, UsersController],
  // providers: [AppService, UsersService],
 //exports: [UsersService, FaceRecognitionModule],
})
export class AppModule {}
