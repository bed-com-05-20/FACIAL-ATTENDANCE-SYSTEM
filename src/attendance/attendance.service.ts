import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceEntity } from 'src/entity/attendance.entity';
import { EnrollmentEntity } from 'src/entity/enrollment.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceEntity)
    private readonly attendanceRepo: Repository<AttendanceEntity>,

    @InjectRepository(EnrollmentEntity) // ✅ Ensure Enrollment is injected
    private readonly enrollmentRepo: Repository<EnrollmentEntity>,
  ) {}

  async markAttendance(regNumber: string, status: 'Present' | 'Absent') {
    // First, check if the student exists in Enrollment table
    const student = await this.enrollmentRepo.findOne({ where: { regNumber } });
  
    if (!student) {
      throw new NotFoundException(`Student with registration number ${regNumber} not found in Enrollment.`);
    }
  
    // Check if attendance already exists for the student
    let attendanceRecord = await this.attendanceRepo.findOne({ where: { regNumber } });
  
    if (!attendanceRecord) {
      // Create a new attendance record
      attendanceRecord = this.attendanceRepo.create({
        regNumber: student.regNumber, 
        status,
      });
  
      // Save the new attendance record
      await this.attendanceRepo.save(attendanceRecord);
    } else {
      // If record exists, update the status
      attendanceRecord.status = status;
      await this.attendanceRepo.save(attendanceRecord);
    }
  
    return {
      // message: 'Attendance marked successfully',
      student: {
        regNumber: student.regNumber,
        status: attendanceRecord.status,
      },
    };
  }
  

  async getAttendanceRecords() {
    return this.attendanceRepo.find(); 
  }
}
