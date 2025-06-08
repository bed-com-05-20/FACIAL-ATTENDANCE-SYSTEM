import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EnrollmentDto } from 'src/dto/enrollment.dto';
import { EnrollmentEntity } from 'src/entity/enrollment.entity';
// import { AttendanceEntity } from 'src/entity/attendance.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(EnrollmentEntity)
    private enrollmentRepository: Repository<EnrollmentEntity>,

    // @InjectRepository(AttendanceEntity)
    // private attendanceRepository: Repository<AttendanceEntity>,
  ) {}

  // async enrollStudent(createStudentDto: EnrollmentDto): Promise<EnrollmentEntity> {
  //   const student = this.enrollmentRepository.create(createStudentDto);
  //   const savedStudent = await this.enrollmentRepository.save(student); 

   
  //   await this.attendanceRepository.save({  
  //     regNumber: savedStudent.regNumber,
  //     status: 'Absent', 
  //   });

  //   return savedStudent; 
  // }

  async getStudentByRegNumber(regNumber: string): Promise<EnrollmentEntity> {
    const student = await this.enrollmentRepository.findOne({ where: { regNumber } });
    if (!student) {
      throw new NotFoundException(`Student with registration number ${regNumber} not found`);
    }
    return student;
  }

  async updateStudentInfo(regNumber: string, updateStudentDto: Partial<EnrollmentDto>): Promise<EnrollmentEntity> {
    const student = await this.getStudentByRegNumber(regNumber);
    Object.assign(student, updateStudentDto);
    return await this.enrollmentRepository.save(student);
  }
}
