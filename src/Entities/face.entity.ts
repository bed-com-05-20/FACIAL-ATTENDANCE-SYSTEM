// face.entity.ts
import { Students } from 'src/attendance/students.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';

@Entity('FaceEntity')
export class FaceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  descriptor: string;

  @Column()
  registrationNumber: string;

  @OneToOne(() => Students, student => student.faceEntity)
  student: Students;
}
