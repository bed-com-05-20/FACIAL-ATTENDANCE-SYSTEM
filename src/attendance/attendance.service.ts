import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './student.entity';


@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>
  ) {}

  async markAttendance(registrationNumber: string, status: string) {
    // ✅ Ensure registrationNumber is a string
    const student = await this.studentRepo.findOne({ where: { registrationNumber } });

    if (!student) {
      throw new NotFoundException("Student not found");
    }

    student.status = status; // ✅ Update status
    await this.studentRepo.save(student);

    return student; // ✅ Return updated student with name, status, and registrationNumber
  }

  async getAttendanceRecords() {
    return this.studentRepo.find(); // ✅ Fetch all students with their attendance status
  }
}
