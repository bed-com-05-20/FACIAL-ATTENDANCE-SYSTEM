import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceModule } from './attendance/attendance.module';
//import { StudentController } from './student/student.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'taya6000',
      database: 'attendance',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AttendanceModule,
  ],
 // controllers: [StudentController],
})
export class AppModule {}

