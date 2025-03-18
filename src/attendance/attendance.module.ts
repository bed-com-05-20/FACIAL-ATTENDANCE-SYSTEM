import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student} from './student.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}

