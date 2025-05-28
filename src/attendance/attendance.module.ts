import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Students} from './students.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { EnrollmentEntity } from 'src/entity/enrollment.entity';
import { EnrollmentModule } from '../enrollment/enrollment.module';

@Module({
  imports: [TypeOrmModule.forFeature([Students])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports:[AttendanceService]
})
export class AttendanceModule {}
