// // GET endpoint to fetch all students who attended a specific exam session
// import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { ExamSessionEntity } from 'src/entity/examsession.entity';
// import { AttendanceHistoryEntity } from 'src/entity/history.entity';
// import { Repository } from 'typeorm';

// @Controller('attendance-history')
// export class AttendanceHistoryController {
//   constructor(
//     @InjectRepository(AttendanceHistoryEntity)
//     private readonly attendanceHistoryRepo: Repository<AttendanceHistoryEntity>,

//     @InjectRepository(ExamSessionEntity)
//     private readonly examSessionRepo: Repository<ExamSessionEntity>,
//   ) {}

//   @Get(':examSessionId')
//   async getSessionAttendance(@Param('examSessionId') examSessionId: number) {
//     const session = await this.examSessionRepo.findOne({ where: { id: examSessionId } });

//     if (!session) {
//       throw new NotFoundException(`Exam session with ID ${examSessionId} not found.`);
//     }

//     const attendanceRecords = await this.attendanceHistoryRepo.find({
//       where: { examSession: { id: examSessionId } },
//       relations: ['student', 'examSession'],
//     });

//     return {
//       session: {
//         id: session.id,
//         courseCode: session.courseCode,
//         courseName: session.courseName,
//         scheduledAt: session.scheduledAt,
//       },
//       attendees: attendanceRecords.map(record => ({
//         id: record.student.id,
//         name: record.student.name,
//         registrationNumber: record.student.registrationNumber,
//         status: record.status,
//         markedAt: record.markedAt,
//       })),
//     };
//   }
// }
