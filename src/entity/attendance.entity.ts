import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mpId: string;

  @Column()
  status: string; 

  @Column({ nullable: true })
  photoPath?: string; 

  @CreateDateColumn()
  timestamp: Date;
}
