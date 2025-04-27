import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Students{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  registrationNumber: string;
  

  @Column({ default: 'absent' }) 
 status: string;
 
 @Column({ type: 'timestamp', nullable: true })
 lastMarkedAt: Date;
}
