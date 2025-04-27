import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Students } from './students.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Students)
    private readonly studentsRepo: Repository<Students>
  ) {}

  //  Mock enrollment for testing
  async mockEnrollStudent(name: string, registrationNumber: string) {
    const existing = await this.studentsRepo.findOne({ where: { registrationNumber } });
    if (existing) {
      return { message: 'Student already exists', students: existing };
    }

    const students = this.studentsRepo.create({ name, registrationNumber, status: 'absent' });
    return this.studentsRepo.save(students);
  }
// Mark attendance for the first time
async markAttendance(registrationNumber: string) {
  const student = await this.studentsRepo.findOne({ where: { registrationNumber } });

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  const currentTime = new Date();

  // Define exam start and end time
  const examStartTime = new Date();
  examStartTime.setHours(10, 10, 0, 0); 
  
  const examEndTime = new Date(examStartTime);
  examEndTime.setMinutes(examStartTime.getMinutes() + 1); 

  // Prevent multiple markings within the exam session
  if (student.lastMarkedAt) {
    const lastMarked = new Date(student.lastMarkedAt);

    const isAlreadyMarked =
      lastMarked >= examStartTime && lastMarked <= examEndTime;

    if (isAlreadyMarked) {
      return {
        message: 'Attendance already marked during this exam session.',
        student: {
          registrationNumber: student.registrationNumber,
          name: student.name,
          status: student.status,
          markedAt: lastMarked.toLocaleString('en-MW', { timeZone: 'Africa/Blantyre' }),
        },
      };
    }
  }

  // Mark attendance for the first time
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

  await this.studentsRepo.save(student);

  return {
    message: `Attendance marked as ${status}`,
    student: {
      registrationNumber: student.registrationNumber,
      name: student.name,
      status: student.status,
      markedAt: currentTime.toLocaleString('en-MW', { timeZone: 'Africa/Blantyre' }),
    },
  };
}




    

  //  Get all attendance records
  async getAttendanceRecords() {
    return this.studentsRepo.find();
  }

  //  Delete a student
  async deleteStudent(registrationNumber: string) {
    const student = await this.studentsRepo.findOne({ where: { registrationNumber } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    await this.studentsRepo.remove(student);
    return { message: 'Student deleted successfully' };
  }
    
}
