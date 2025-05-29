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

  /**
   * Mock enrollment of a student 
   * If the student already exists, return the existing entry.
   */
  async mockEnrollStudent(name: string, registrationNumber: string) {
    const existing = await this.studentsRepo.findOne({ where: { registrationNumber } });
    if (existing) {
      return { message: 'Student already exists', students: existing };
    }

    const students = this.studentsRepo.create({ name, registrationNumber, status: 'absent' });
    return this.studentsRepo.save(students);
  }

  /**
   * Marks attendance for a student based on their registration number.
   * Prevents multiple markings within the same session.
   */
  async markAttendance(registrationNumber: string) {
    const student = await this.studentsRepo.findOne({ where: { registrationNumber } });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const currentTime = new Date();

    // Define exam start and  time 
    const examStartTime = new Date();
    examStartTime.setHours(2, 0, 0, 0); 
    
    const examEndTime = new Date(examStartTime);
    examEndTime.setMinutes(examStartTime.getMinutes() + 1); 

    // Check if the student has already been marked during this session
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

    // Determine status based on the current time
    let status: string;
    if (currentTime <= examStartTime) {
      status = 'present';
    } else if (currentTime > examStartTime && currentTime <= examEndTime) {
      status = 'late';
    } else {
      status = 'absent';
    }

    // Update and save student record
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

  
   // Retrieves all attendance records.
   
  async getAttendanceRecords() {
    return this.studentsRepo.find();
  }

  
   //Deletes a student by registration number.
   
  async deleteStudent(registrationNumber: string) {
    const student = await this.studentsRepo.findOne({ where: { registrationNumber } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    await this.studentsRepo.remove(student);
    return { message: 'Student deleted successfully' };
  }
}
