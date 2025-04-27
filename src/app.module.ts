import { Module } from '@nestjs/common';
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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
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
})
export class AppModule {}

