// face.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('faces')
export class FaceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ type: 'text' })
  descriptor: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: true })
  userId: string | null;
}
