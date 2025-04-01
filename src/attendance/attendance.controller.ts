import { Controller, Post, Get, Body, NotFoundException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ApiTags } from '@nestjs/swagger';
import { MarkAttendanceDto } from 'src/dto/markattendance_dto';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  async markAttendance(@Body() markAttendanceDto: MarkAttendanceDto) {
    const { regNumber, status } = markAttendanceDto;
    const updatedStudent = await this.attendanceService.markAttendance(regNumber, status);

    return {
      message: "Attendance marked successfully",
      student: updatedStudent
    };
  }

  @Get()
  async getAttendanceRecords() {
    return this.attendanceService.getAttendanceRecords();
  }
}
