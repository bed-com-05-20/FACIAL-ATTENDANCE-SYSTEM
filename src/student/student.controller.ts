import { Controller, Post, Get, Body } from '@nestjs/common';
import { StudentService } from './student.service';
import { ApiTags} from '@nestjs/swagger';
import { StudentDto } from './dto/student_dto';

@ApiTags('Attendance')
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  async addStudent(@Body() studentDto: StudentDto) {
    return await this.studentService.createStudent(studentDto);
        

  }

  @Get()
  async getAllStudents() {
    return this.studentService.getAllStudents();
  }
}
