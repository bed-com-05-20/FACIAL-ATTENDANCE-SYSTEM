// attendance-history.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { Students } from 'src/attendance/students.entity';
import { ExamSessionEntity } from './examsession.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('attendance_history')
export class AttendanceHistoryEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @ManyToOne(() => Students, { eager: true })
  student: Students;

  @ManyToOne(() => ExamSessionEntity, { eager: true })
  examSession: ExamSessionEntity;

  @Column({ default: 'Present' })
  status: string;

  @CreateDateColumn()
  markedAt: Date;
}
