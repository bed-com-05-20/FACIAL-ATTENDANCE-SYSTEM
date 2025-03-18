import { Controller, Post, Get, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  async markAttendance(
    @Body('registrationNumber') registrationNumber: number,
    @Body('status') status: string,
    @Body('name') name: string
  ) {
    return this.attendanceService.markAttendance(registrationNumber, status);
  }

  @Get()
  async getAttendanceRecords() {
    return this.attendanceService.getAttendanceRecords();
  }
}
