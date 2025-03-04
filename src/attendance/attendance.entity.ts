import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn()
  regNumber: string;

  @Column()
  name: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  photoPath?: string;

  @CreateDateColumn()
  timestamp: Date;
}
