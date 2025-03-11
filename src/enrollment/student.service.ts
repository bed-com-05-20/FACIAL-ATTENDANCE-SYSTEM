import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from 'src/entity/Student';
import { StudentDto } from 'src/dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentEntity)
    private studentsRepository: Repository<StudentEntity>,
  ) {}

  async enrollStudent(createStudentDto: StudentDto): Promise<StudentEntity> {
    const student = this.studentsRepository.create(createStudentDto);
    return await this.studentsRepository.save(student);
  }

  async getStudentByRegNumber(regNumber: string): Promise<StudentEntity> {
    const student = await this.studentsRepository.findOne({ where: { regNumber } });
    if (!student) {
      throw new NotFoundException(`Student with registration number ${regNumber} not found`);
    }
    return student;
  }

  async updateAttendanceStatus(regNumber: string, status: 'Present' | 'Absent'): Promise<StudentEntity> {
    const student = await this.getStudentByRegNumber(regNumber);
    student.attendanceStatus = status;
    return await this.studentsRepository.save(student);
  }

  async updateStudentInfo(regNumber: string, updateStudentDto: Partial<StudentDto>): Promise<StudentEntity> {
    const student = await this.getStudentByRegNumber(regNumber);

    Object.assign(student, updateStudentDto);

    return await this.studentsRepository.save(student);
  }
}
