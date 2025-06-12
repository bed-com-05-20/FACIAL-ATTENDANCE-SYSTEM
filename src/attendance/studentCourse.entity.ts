// import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
// import { Students } from './students.entity';
// import { Session } from './course.entity';

// @Entity()
// export class StudentSession {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   status: 'present' | 'absent';

//   @ManyToOne(() => Students, student => student.sessions, { eager: true, onDelete: 'CASCADE' })
//   student: Students;

//   @ManyToOne(() => Session, session => session.students, { onDelete: 'CASCADE' })
//   session: Session;

// }
