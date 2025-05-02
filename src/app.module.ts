import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceModule } from './attendance/attendance.module';

// Additional imports from other branch

import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { User } from './Entities/users.entity';
import { FaceRecognitionController } from './services/face-recognition.controller';
import { FaceRecognitionService } from './services/face-recognition.services';
import { MulterModule } from '@nestjs/platform-express';
import { FaceRecognitionModule } from './services/face-recognition.model';

@Module({
  imports: [
    
    MulterModule.register({ dest: './uploads' }),
    
    // database connection
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'taya6000', 
      database: 'attendance',
      entities: [User],
      synchronize: false, 
      autoLoadEntities: true, 
    }),
    
    
    AttendanceModule,
    UsersModule,
    FaceRecognitionModule,
  ],
  
  controllers: [
    
    UsersController,
    FaceRecognitionController, // added this
  ],
  
  providers: [
    
    UsersService,
    FaceRecognitionService,
  ],
})
export class AppModule {}
