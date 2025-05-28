import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AttendanceModule } from './attendance/attendance.module';
import { FaceRecognitionModule } from './services/face-recognition.model'; // Make sure this is correctly named and points to a `.module.ts` file

import { User } from './Entities/users.entity';
import { Students } from './attendance/students.entity';
import { FaceEntity } from './Entities/face.entity';
import { CameraModule } from './camera/camera.module';
import { FaceGateway } from './FaceGateway/face_gateway';
import { GatewayModule } from './face-gateway/face-gateway.module';

@Module({
  imports: [
    MulterModule.register({ dest: './uploads' }),
    TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5432,
    //   username: 'postgres',
    //   password: 'admin',
    //  // database: 'attendance',
    //   database: 'mydb',
     type: 'postgres',
     url: 'postgres://yrfsvjec:2nJPN38MBU1fDq-DAcPKvk-HHAp8AYZY@lucky.db.elephantsql.com/yrfsvjec',
    
      entities: [User,Students,FaceEntity],
      synchronize: false,

    }),
    UsersModule,
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
