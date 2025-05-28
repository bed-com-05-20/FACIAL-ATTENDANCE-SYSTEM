// face.entity.ts
import { Students } from 'src/attendance/students.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';

@Entity('FaceEntity')
export class FaceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

 @Column({ type: 'text' }) // Store descriptor as JSON string
  descriptor: string;

 @Column({ unique: true })
   registrationNumber: string;

  @OneToOne(() => Students, student => student.faceEntity)
  student: Students;
}
