import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { StudentsModule } from './enrollment/student.module';
import { StudentEntity } from './entity/Student';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'nestuser',
      password: 'nestpassword',
      database: 'facial_attendance',
      entities: [StudentEntity],
      synchronize: true, 
    }),
    StudentsModule,
  ],
})
export class AppModule {}

