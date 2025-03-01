import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
  ) {}

  async markAttendance(mpId: string, status: string, photoPath?: string): Promise<Attendance> {
    const attendance = this.attendanceRepo.create({ mpId, status, photoPath });
    return await this.attendanceRepo.save(attendance);
  }

  async getAttendanceRecords(): Promise<Attendance[]> {
    return await this.attendanceRepo.find();
  }
}
