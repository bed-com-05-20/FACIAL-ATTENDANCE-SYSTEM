import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { User } from './Entities/users.entity';
import { MulterModule } from '@nestjs/platform-express';
import { FaceRecognitionModule } from './services/face-recognition.model';
import { FaceEntity } from './Entities/face.entity';

@Module({
  imports: [
    
    MulterModule.register({ dest: './uploads' }),
    
    // database connection
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
