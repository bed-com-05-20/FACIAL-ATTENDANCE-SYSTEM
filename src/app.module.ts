import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AttendanceModule } from './attendance/attendance.module';
import { FaceRecognitionModule } from './services/face-recognition.model'; // Make sure this is correctly named and points to a `.module.ts` file

import { User } from './Entities/users.entity';
import { Students } from './attendance/students.entity';
import { FaceEntity } from './Entities/face.entity';
import { CameraController } from './services/camera.controller';
import { CameraModule } from './camera/camera.module';

@Module({
  imports: [
    MulterModule.register({ dest: './uploads' }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'taya6000',
      database: 'attendance',
      entities: [User,Students,FaceEntity],
      synchronize: false,
    }),
    UsersModule,
    AttendanceModule,
    FaceRecognitionModule,
    CameraModule, // This module should handle the controller/service
  ],
  controllers: [],
  providers: [],
  
  // controllers: [AppController, UsersController],
  // providers: [AppService, UsersService],
 //exports: [UsersService, FaceRecognitionModule],
})
export class AppModule {}
