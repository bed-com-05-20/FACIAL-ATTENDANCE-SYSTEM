import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceModule } from './attendance/attendance.module';
//import { StudentController } from './student/student.controller';

@Module({
  imports: [
=======
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Entities/users.entity';
import { FaceRecognitionController } from './services/face-recognition.controller';
import { FaceRecognitionService } from './services/face-recognition.services';
import { MulterModule } from '@nestjs/platform-express';
import { FaceRecognitionModule } from './services/face-recognition.model';

@Module({
  imports: [
    MulterModule.register({ dest: './uploads' }),
>>>>>>> origin/bed-com-21-20
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
<<<<<<< HEAD
      username: 'postgres',
      password: 'taya6000',
      database: 'attendance',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AttendanceModule,
  ],
 // controllers: [StudentController],
=======
      username: 'postgres', 
      password: 'admin', 
      database: 'mydb', 
      entities: [User],
      synchronize: false, 
    }),
    UsersModule,
    FaceRecognitionModule,
  ],
  controllers: [],
  providers: [],
  // controllers: [AppController, UsersController],
  // providers: [AppService, UsersService],
 //exports: [UsersService, FaceRecognitionModule],
>>>>>>> origin/bed-com-21-20
})
export class AppModule {}

