import { Controller, Post, Get, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  async markAttendance(
    @Body('registrationNumber') registrationNumber: string,
    @Body('status') status: string
  ) {
    return this.attendanceService.markAttendance(registrationNumber, status);
  }

  @Get()
  async getAttendanceRecords() {
    return this.attendanceService.getAttendanceRecords();
  }
}
