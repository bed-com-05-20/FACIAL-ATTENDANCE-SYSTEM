import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Students} from './students.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Course } from './course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Students,Course])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports:[AttendanceService]
})
export class AttendanceModule {}

