import { Entity, PrimaryGeneratedColumn, Column , CreateDateColumn} from "typeorm";

@Entity()
export class StudentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  regNumber: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  yearOfStudy: string;

  @Column()
  programOfStudy: string;

  @Column()
  gender: string;

  @Column({ nullable: true })
  picture: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ default: 'Absent' })
  attendanceStatus: string;
}
