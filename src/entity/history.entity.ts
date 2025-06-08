// attendance-history.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Students } from 'src/attendance/students.entity';
import { ExamSessionEntity } from './examsession.entity';

@Entity('attendance_history')
export class AttendanceHistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Students, student => student.id)
  student: Students;

  @ManyToOne(() => ExamSessionEntity, session => session.attendanceHistories)
  examSession: ExamSessionEntity;

  @Column({ 
    type: 'enum', 
    enum: ['Present', 'Absent'], 
    default: 'Present' 
  })
  status: 'Present' | 'Absent';

  @CreateDateColumn()
  markedAt: Date;
}
