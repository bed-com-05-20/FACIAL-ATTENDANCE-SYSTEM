import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Students} from './students.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Course } from './course.entity';
//import { StudentSession } from './studentCourse.entity';
import { Session } from 'inspector/promises';

@Module({
  imports: [TypeOrmModule.forFeature([Students,Course])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports:[AttendanceService]
})
export class AttendanceModule {}

