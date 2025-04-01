import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class AttendanceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) 
  regNumber: string;

  @Column({ 
    type: 'enum', 
    enum: ['Present', 'Absent'], 
    default: 'Absent'
  })
  status: 'Present' | 'Absent';

  @CreateDateColumn()
  timestamp: Date;
}
