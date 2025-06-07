import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Students } from './students.entity';

@Injectable()
export class AttendanceService {
  attendanceService: any;
  enrolluser(arg0: { registrationNumber: string; name: string | null; }) {
    throw new Error('Method not implemented.');
  }
  enrollStudent(name: string, registrationNumber: string) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Students)
    private readonly studentsRepo: Repository<Students>,
  ) {}

  /**
   * Enroll student if not already in DB. Return message accordingly.
   * If name is not provided but the student exists, skip enrollment.
   */
    async enroll(registrationNumber: string, name?: string) {
    const existing = await this.studentsRepo.findOne({ where: { registrationNumber } });

    if (existing) {
      return {
        message: 'Student already enrolled.',
        student: existing,
      };
    }

    if (!name) {
      return {
        message: 'Student not enrolled: name is required for first-time enrollment.',
        student: null,
      };
    }

    const student = this.studentsRepo.create({
      registrationNumber,
      name,
      status: 'absent',
    });

    await this.studentsRepo.save(student);

    return {
      message: 'Student enrolled successfully.',
      student,
    };
  }

  
  /**
   * Marks attendance based on the registration number.
   * Prevents multiple markings within same exam session.
   */
  async markAttendance(registrationNumber: string) {
    const student = await this.studentsRepo.findOne({ where: { registrationNumber } });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const currentTime = new Date();

    // Define exam time window
    const examStartTime = new Date();
    examStartTime.setHours(21, 50, 0, 0);

    const examEndTime = new Date(examStartTime);
    examEndTime.setMinutes(examStartTime.getMinutes() + 1);

    // Prevent double-marking
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

    // Determine status
    let status: string;
    if (currentTime <= examStartTime) {
      status = 'present';
    } else if (currentTime <= examEndTime) {
      status = 'late';
    } else {
      status = 'absent';
    }

    // Update record
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

  /**
   * Retrieves all student attendance records.
   */
  async getAttendanceRecords() {
    return this.studentsRepo.find();
  }

  /**
   * Deletes a student using registration number.
   */
  async deleteStudent(registrationNumber: string) {
    const student = await this.studentsRepo.findOne({ where: { registrationNumber } });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    await this.studentsRepo.remove(student);
    return { message: 'Student deleted successfully' };
  }

  /**
   * Marks all students as absent and clears last marked timestamps.
   */
  async markAllAsAbsent() {
    const students = await this.studentsRepo.find();

    const updated = students.map((s) => {
      s.status = 'absent';
      s.lastMarkedAt = null;
      return s;
    });

    await this.studentsRepo.save(updated);

    return {
      message: 'All students marked absent.',
      students: updated,
    };
  }
}
