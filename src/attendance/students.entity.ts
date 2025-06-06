// students.entity.ts
import { FaceEntity } from 'src/Entities/face.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity('students')
export class Students {
  @Column()
  @PrimaryGeneratedColumn()
  id:number
  
  @Column()
  name: string;

  @Column({ unique: true })
   registrationNumber: string;

  @Column()
  status: string;

 @Column({ type: 'timestamp', nullable: true })
  lastMarkedAt: Date | null;

  @OneToOne(() => FaceEntity, faceEntity => faceEntity.student, { nullable: true })
  @JoinColumn()
  faceEntity: FaceEntity;
}
