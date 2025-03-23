import { Controller, Post, Get, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Attendance') // Group in Swagger
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Mark attendance for an MP' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mpId: { type: 'string' },
        status: { type: 'string', example: 'Present' },
        photoPath: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Attendance marked successfully' })
  async markAttendance(
    @Body('mpId') mpId: string,
    @Body('status') status: string,
    @Body('photoPath') photoPath?: string,
  ) {
    return this.attendanceService.markAttendance(mpId, status, photoPath);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance records' })
  @ApiResponse({ status: 200, description: 'Returns all attendance records' })
  async getAttendanceRecords() {
    return this.attendanceService.getAttendanceRecords();
  }
}
