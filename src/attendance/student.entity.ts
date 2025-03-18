import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  registrationNumber: number;

  @Column()
  name: string;

  @Column({ default: 'Absent' })
  status: string;  // "Present" or "Absent"
}

