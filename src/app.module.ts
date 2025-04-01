import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AttendanceModule } from './attendance/attendance.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { EnrollmentEntity } from './entity/enrollment.entity';
import { AttendanceEntity } from './entity/attendance.entity';

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
      entities: [EnrollmentEntity, AttendanceEntity],
      synchronize: true, 
    }),
    EnrollmentModule, AttendanceModule,
  ],
})
export class AppModule {}