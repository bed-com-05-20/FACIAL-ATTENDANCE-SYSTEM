import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { StudentsService } from './student.service';
import { ApiTags } from '@nestjs/swagger';
import { StudentDto } from 'src/dto/student.dto';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post('enroll')
  async enrollStudent(@Body() createStudentDto: StudentDto) {
    return this.studentsService.enrollStudent(createStudentDto);
  }

  @Get(':regNumber')
  async getStudent(@Param('regNumber') regNumber: string) {
    return this.studentsService.getStudentByRegNumber(regNumber);
  }

  @Patch(':regNumber/attendance')
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
