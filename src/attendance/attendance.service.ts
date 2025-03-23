import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from 'src/entity/attendance.entity';
import { Repository } from 'typeorm';

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
