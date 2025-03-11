import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { StudentsService } from './student.service';
import { StudentEntity } from 'src/entity/Student';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { StudentDto } from 'src/dto/student.dto';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('enroll')
  @ApiOperation({ summary: 'Enroll a new student' })
  @ApiResponse({ status: 201, description: 'Student enrolled successfully.', type: StudentEntity })
  @ApiBody({ type: StudentDto })
  async enrollStudent(@Body() createStudentDto: StudentDto) {
    return this.studentsService.enrollStudent(createStudentDto);
  }

  @Get(':regNumber')
  @ApiOperation({ summary: 'Get student by registration number' })
  @ApiResponse({ status: 200, description: 'Student found.', type: StudentEntity })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  @ApiParam({ name: 'regNumber', description: 'Student registration number' })
  async getStudent(@Param('regNumber') regNumber: string) {
    return this.studentsService.getStudentByRegNumber(regNumber);
  }

  @Patch(':regNumber/attendance')
  @ApiOperation({ summary: 'Update student attendance status' })
  @ApiResponse({ status: 200, description: 'Attendance status updated.', type: StudentEntity })
  @ApiParam({ name: 'regNumber', description: 'Student registration number' })
  @ApiBody({ schema: { properties: { status: { type: 'string', enum: ['Present', 'Absent'] } } } })
  async updateAttendance(@Param('regNumber') regNumber: string, @Body('status') status: 'Present' | 'Absent') {
    return this.studentsService.updateAttendanceStatus(regNumber, status);
  }

  @Patch(':regNumber')
  async updateStudent(
    @Param('regNumber') regNumber: string,
    @Body() updateStudentDto: Partial<StudentDto>
  ) {
    return this.studentsService.updateStudentInfo(regNumber, updateStudentDto);
  }
}
