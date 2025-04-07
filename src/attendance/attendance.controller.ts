import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/markattendance_dto';
import { MockEnrollDto } from './dto/mockenroll_dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  //  Mock enroll a student 

@Post('mock-enroll')
async mockEnroll(@Body() data: MockEnrollDto) {
  return this.attendanceService.mockEnrollStudent(data.name, data.registrationNumber);
}


  //  Mark attendance for a student
  @Post('mark')
  async mark(@Body() dto: MarkAttendanceDto) {
    const updated = await this.attendanceService.markAttendance(dto.registrationNumber);
    return { message: 'Attendance marked', student: updated };
  }

  //  Get all attendance records
  @Get()
  async getRecords() {
    return this.attendanceService.getAttendanceRecords();
  }

  //  Delete a student by registration number
  @Delete(':registrationNumber')
  async deleteStudent(@Param('registrationNumber') registrationNumber: string) {
    return this.attendanceService.deleteStudent(registrationNumber);
  }
}
