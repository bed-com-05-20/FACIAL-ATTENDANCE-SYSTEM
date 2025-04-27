import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Students} from './students.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Students])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}

