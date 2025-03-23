import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { StudentsModule } from './enrollment/student.module';
import { StudentEntity } from './entity/Student.entity';
import { Attendance } from './entity/attendance.entity';
import { AttendanceModule } from './attendance/attendance.module';

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
      entities: [StudentEntity, Attendance],
      synchronize: true, 
    }),
    StudentsModule, AttendanceModule,
  ],
})
export class AppModule {}