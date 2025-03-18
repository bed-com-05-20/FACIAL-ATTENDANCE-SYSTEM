import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';

@Injectable()
export class AttendanceService {
  constructor(@InjectRepository(Student) private studentRepo: Repository<Student>) {}

  async markAttendance(registrationNumber: number, status: string) {
    const student = await this.studentRepo.findOne({ where: { registrationNumber } });
    if (!student) {
      throw new Error('Student not found');
    }

    student.status = status;  // Update attendance
    await this.studentRepo.save(student);
    return { message: 'Attendance updated successfully', student };
  }

  async getAttendanceRecords() {
    return this.studentRepo.find();
  }
}
