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

  //  Mock enrollment for testing
  async mockEnrollStudent(name: string, registrationNumber: string) {
    const existing = await this.studentRepo.findOne({ where: { registrationNumber } });
    if (existing) {
      return { message: 'Student already exists', student: existing };
    }

    const student = this.studentRepo.create({ name, registrationNumber, status: 'absent' });
    return this.studentRepo.save(student);
  }
// marking attendance
async markAttendance(registrationNumber: string) {
  const student = await this.studentRepo.findOne({ where: { registrationNumber } });

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  const currentTime = new Date();

  // Define exam start and end time
  const examStartTime = new Date(currentTime);
  examStartTime.setHours(9, 36, 0, 0); // Exam starts at 9:27 AM

  const examEndTime = new Date(examStartTime);
  examEndTime.setMinutes(examStartTime.getMinutes() + 1); // Exam ends 1 minute later

  // Prevent multiple markings within the same exam session
  if (student.lastMarkedAt) {
    const lastMarked = new Date(student.lastMarkedAt);
    const alreadyMarked =
      lastMarked >= examStartTime && lastMarked <= examEndTime;

    if (alreadyMarked) {
      return {
        message: 'Attendance already marked during this exam session.',
        student: {
          registrationNumber: student.registrationNumber,
          name: student.name,
          status: student.status,
          markedAt: new Date(student.lastMarkedAt).toLocaleString('en-MW', {
            timeZone: 'Africa/Blantyre',
          }),
        },
      };
    }
  }

  // Mark attendance for first time
  let status: string;

  if (currentTime <= examStartTime) {
    status = 'present';
  } else if (currentTime > examStartTime && currentTime <= examEndTime) {
    status = 'late';
  } else {
    status = 'absent';
  }

  student.status = status;
  student.lastMarkedAt = currentTime;

  await this.studentRepo.save(student);

  return {
    message: `Attendance marked as ${status}`,
    student: {
      registrationNumber: student.registrationNumber,
      name: student.name,
      status: student.status,
      markedAt: new Date(currentTime).toLocaleString('en-MW', {
        timeZone: 'Africa/Blantyre',
      }),
    },
  };
}


    

  //  Get all attendance records
  async getAttendanceRecords() {
    return this.studentRepo.find();
  }

  //  Delete a student
  async deleteStudent(registrationNumber: string) {
    const student = await this.studentRepo.findOne({ where: { registrationNumber } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    await this.studentRepo.remove(student);
    return { message: 'Student deleted successfully' };
  }
    
}
