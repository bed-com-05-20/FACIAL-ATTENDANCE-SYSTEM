import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Students } from './students.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  examName: string;

  @Column()
  room: string;

  @Column({ type: 'timestamp', nullable: true }) 
 date: string;


  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column()
  supervisor: string;

  @ManyToMany(() => Students, student => student.courses)
  students: Students[];
}
