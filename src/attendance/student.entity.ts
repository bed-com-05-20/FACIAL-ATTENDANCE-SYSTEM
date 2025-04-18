import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  registrationNumber: string;
  

  @Column({ default: 'absent' }) 
  status: string;
  lastMarkedAt: Date;
}
