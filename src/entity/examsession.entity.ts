// exam-session.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AttendanceHistoryEntity } from './history.entity';

@Entity('exam_sessions')
export class ExamSessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courseCode: string; 
  @Column()
  courseName: string;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @OneToMany(() => AttendanceHistoryEntity, history => history.examSession)
  attendanceHistories: AttendanceHistoryEntity[];
}
