import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MockEnrollDto } from 'src/dto/mockenroll_dto';
import { MarkAttendanceDto } from 'src/dto/markattendance_dto';

@ApiTags('Attendance') 
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Mock enroll a student with name and registration number
   */
  @Post('mock-enroll')
  @ApiOperation({ summary: 'Mock enroll a student' })
  @ApiResponse({ status: 201, description: 'Student enrolled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async mockEnroll(@Body() data: MockEnrollDto) {
    return this.attendanceService.mockEnrollStudent(data.name, data.registrationNumber);
  }

  /**
   * Mark attendance for a student using registration number
   */
  @Post('mark')
  @ApiOperation({ summary: 'Mark attendance for a student' })
  @ApiResponse({ status: 200, description: 'Attendance marked successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async mark(@Body() dto: MarkAttendanceDto) {
    const updated = await this.attendanceService.markAttendance(dto.registrationNumber);
    return { message: 'Attendance marked', student: updated };
  }

  /**
   * Get all attendance records
   */
  @Get()
  @ApiOperation({ summary: 'Get all attendance records' })
  @ApiResponse({ status: 200, description: 'List of all attendance records' })
  async getRecords() {
    return this.attendanceService.getAttendanceRecords();
  }

  /**
   * Delete a student by registration number
   */
  @Delete(':registrationNumber')
  @ApiOperation({ summary: 'Delete student by registration number' })
  @ApiResponse({ status: 200, description: 'Student deleted successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async deleteStudent(@Param('registrationNumber') registrationNumber: string) {
    return this.attendanceService.deleteStudent(registrationNumber);
  }
}
