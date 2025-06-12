import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Students } from './students.entity';
import { Course } from './course.entity';
import { CreateCourseDto } from 'src/attendance/dto/create-course.dto';

@Injectable()
export class AttendanceService {
  attendanceService: any;
  attendanceRepository: any;
  constructor(
    @InjectRepository(Students)
    private readonly studentsRepo: Repository<Students>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,

  ) {}

  /**
   * Enroll student if not already in DB. Return message accordingly.
   * If name is not provided but the student exists, skip enrollment.
   */
    async enroll(registrationNumber: string, name?: string) {
    const existing = await this.studentsRepo.findOne({ where: { registrationNumber } });

    if (existing) {
      return {
        message: 'Student already enrolled.',
        student: existing,
      };
    }

    if (!name) {
      return {
        message: 'Student not enrolled: name is required for first-time enrollment.',
        student: null,
      };
    }

    const student = this.studentsRepo.create({
      registrationNumber,
      name,
      status: 'absent',
    });

    await this.studentsRepo.save(student);

    return {
      message: 'Student enrolled successfully.',
      student,
    };
  }

  
  /**
   * Marks attendance based on the registration number.
   * Prevents multiple markings within same exam session.
   */
async markAttendance(registrationNumber: string) {
  const student = await this.studentsRepo.findOne({
    where: { registrationNumber },
  });

  if (!student) {
    throw new NotFoundException('Student not found');
  }

  const currentTime = new Date();

  // Check if attendance was already marked today
  if (student.lastMarkedAt) {
    const lastMarked = new Date(student.lastMarkedAt);

    const alreadyMarkedToday =
      currentTime.getFullYear() === lastMarked.getFullYear() &&
      currentTime.getMonth() === lastMarked.getMonth() &&
      currentTime.getDate() === lastMarked.getDate();

    if (alreadyMarkedToday) {
      return {
        message: 'Attendance already marked today.',
        student: {
          registrationNumber: student.registrationNumber,
          name: student.name,
          status: student.status,
          markedAt: lastMarked.toLocaleString('en-MW', {
            timeZone: 'Africa/Blantyre',
          }),
        },
      };
    }
  }

  // Mark the student as present
  student.status = 'present';
  student.lastMarkedAt = currentTime;

  await this.studentsRepo.save(student);

  return {
    message: 'Attendance marked as present.',
    student: {
      registrationNumber: student.registrationNumber,
      name: student.name,
      status: student.status,
      markedAt: currentTime.toLocaleString('en-MW', {
        timeZone: 'Africa/Blantyre',
      }),
    },
  };
}


  /**
   * Retrieves all student attendance records.
   */
  async getAttendanceRecords() {
    return this.studentsRepo.find();
  }

  /**
   * Deletes a student using registration number.
   */
  async deleteStudent(registrationNumber: string) {
    const student = await this.studentsRepo.findOne({ where: { registrationNumber } });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    await this.studentsRepo.remove(student);
    return { message: 'Student deleted successfully' };
  }

  /**
   * Marks all students as absent and clears last marked timestamps.
   */
  async markAllAsAbsent() {
    const students = await this.studentsRepo.find();

    const updated = students.map((s) => {
      s.status = 'absent';
      s.lastMarkedAt = null;
      return s;
    });

    await this.studentsRepo.save(updated);

    return {
      message: 'All students marked absent.',
      students: updated,
    };
  }


  /*
  this is history generation functions
  */ 
    async createCourseWithStudents(dto: CreateCourseDto): Promise<Course> {
      const students = await this.studentsRepo.find({
    where: {
      registrationNumber: In(dto.studentIds),
    },
  });

  if (students.length === 0) {
    throw new NotFoundException('No students found with provided registration numbers.');
  }
    const course = this.courseRepo.create({
      examName: dto.examName,
      room: dto.room,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      supervisor: dto.supervisor,
      students,
    });

    return this.courseRepo.save(course);
  }

  async findCourseWithStudents(id: number): Promise<Course> {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['students'],
    });

    if (!course) throw new NotFoundException(`Course with ID ${id} not found`);
    return course;
  }

  async findAllCoursesWithStudents(): Promise<Course[]> {
    return this.courseRepo.find({
      relations: ['students'],
    });
  }

async deleteCourses(ids: number[]) {
  const courses = await this.courseRepo.find({
    where: { id: In(ids) },
    relations: ['students'],
  });

  const existingIds = courses.map(course => course.id);
  const notFound = ids.filter(id => !existingIds.includes(id));

  if (existingIds.length === 0) {
    throw new NotFoundException('No matching courses found to delete.');
  }

  // Remove student associations first
  for (const course of courses) {
    course.students = [];
    await this.courseRepo.save(course);
  }

  // Now delete courses
  await this.courseRepo.delete(existingIds);

  return {
    deleted: existingIds,
    notFound,
  };
}


  
  
}