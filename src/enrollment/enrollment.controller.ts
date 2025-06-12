import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentDto } from 'src/attendance/dto/enrollment.dto';

@ApiTags('students')
@Controller('students')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  // @Post('enroll')
  // async enrollStudent(@Body() createEnrollmentDto: EnrollmentDto) {
  //   return this.enrollmentService.enrollStudent(createEnrollmentDto);
  // }

  @Get(':regNumber')
  async getStudent(@Param('regNumber') regNumber: string) {
    return this.enrollmentService.getStudentByRegNumber(regNumber);
  }

  @Patch(':regNumber')
  async updateStudent(
    @Param('regNumber') regNumber: string,
    @Body() updateStudentDto: Partial<EnrollmentDto>
  ) {
    return this.enrollmentService.updateStudentInfo(regNumber, updateStudentDto);
  }
}
