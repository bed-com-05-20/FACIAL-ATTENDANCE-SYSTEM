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

    const student = this.studentRepo.create({ name, registrationNumber, status: 'Not Marked' });
    return this.studentRepo.save(student);
  }

  //  Mark attendance
 
  async markAttendance(registrationNumber: string) {
    const student = await this.studentRepo.findOne({ where: { registrationNumber } });
  
    if (!student) {
      throw new NotFoundException('Student not found');
    }
  
    // Get the current time
    const currentTime = new Date();
    const examStartTime = new Date(currentTime);
    examStartTime.setHours(20, 0, 0, 0); 
  
    // Define a grace period
    const gracePeriodEndTime = new Date(examStartTime);
    gracePeriodEndTime.setMinutes(examStartTime.getMinutes() + 60);  // Adding minutes for grace period
  
    let status: string;
  
    // If current time is before the class starts, mark as "present"
    if (currentTime <= examStartTime) {
      status = 'present';
    } 
    // If current time is between the class start time and the grace period end, mark as "late"
    else if (currentTime >= examStartTime && currentTime <= gracePeriodEndTime) {
      status = 'late';
    } 

    // If current time is after the grace period end, mark as "absent"
    else {
      status = 'absent';
    }
  
    // Update the student's status
    student.status = status;
    return this.studentRepo.save(student);
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
