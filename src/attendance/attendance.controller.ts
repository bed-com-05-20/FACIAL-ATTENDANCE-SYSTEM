import { Controller, Post, Get, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ApiTags } from '@nestjs/swagger';
import { MarkAttendanceDto } from './dto/markattendance_dto';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  async markAttendance(@Body() markAttendanceDto: MarkAttendanceDto) {
    const { registrationNumber, status } = markAttendanceDto;
    const updatedStudent = await this.attendanceService.markAttendance(registrationNumber, status);

    return {
      message: "Attendance marked successfully",
      student: {
        registrationNumber: updatedStudent.registrationNumber,
        name: updatedStudent.name, 
        status: updatedStudent.status
      }
    };
  }

  @Get()
  async getAttendanceRecords() {
    return this.attendanceService.getAttendanceRecords();
  }
}
