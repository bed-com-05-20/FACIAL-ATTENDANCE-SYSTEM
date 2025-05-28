// face.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Students } from 'src/attendance/students.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';

@Entity('FaceEntity')
export class FaceEntity {
   @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: number;

 @Column({ type: 'text' }) // Store descriptor as JSON string
  descriptor: string;
@ApiProperty()
 @Column({ unique: true })
   registrationNumber: string;

  @OneToOne(() => Students, student => student.faceEntity)
  student: Students;
}
