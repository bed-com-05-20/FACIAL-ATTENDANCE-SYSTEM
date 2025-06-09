import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Students } from './students.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  examName: string;

  @Column()
  room: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column()
  supervisor: string;

  @ManyToMany(() => Students, student => student.courses)
  students: Students[];
}
