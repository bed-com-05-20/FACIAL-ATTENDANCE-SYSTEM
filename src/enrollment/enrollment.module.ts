import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentEntity } from 'src/entity/enrollment.entity';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
// import { AttendanceEntity } from 'src/entity/attendance.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([EnrollmentEntity]) 
  ], 
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
