import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  registrationNumber: string;

  @Column()
  name: string;

  @Column()
  status: string;  // "Present" or "Absent"
}

