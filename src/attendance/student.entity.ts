import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Student {
  
  @Column({ unique: true })
  registrationNumber: string;

  @Column()
  name: string;

  @Column({ default: 'Absent' })
  status: string;  // "Present" or "Absent"
}

