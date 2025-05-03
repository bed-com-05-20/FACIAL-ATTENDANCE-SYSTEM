import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Entities/users.entity';
import { MulterModule } from '@nestjs/platform-express';
import { FaceRecognitionModule } from './services/face-recognition.model';
import { FaceEntity } from './Entities/face.entity';

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
      entities: [User, FaceEntity],
      synchronize: true, 
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

