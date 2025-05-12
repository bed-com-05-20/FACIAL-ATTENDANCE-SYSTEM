// students.entity.ts
import { FaceEntity } from 'src/Entities/face.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity('students')
export class Students {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  registrationNumber: string;

  @Column()
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMarkedAt: Date;

  @OneToOne(() => FaceEntity, faceEntity => faceEntity.student, { nullable: true })
  @JoinColumn()
  faceEntity: FaceEntity;
}
