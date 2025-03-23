import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mpId: string;

  @Column()
  status: string; // "Present" or "Absent"

  @Column({ nullable: true })
  photoPath?: string; // Path to image

  @CreateDateColumn()
  timestamp: Date;
}
