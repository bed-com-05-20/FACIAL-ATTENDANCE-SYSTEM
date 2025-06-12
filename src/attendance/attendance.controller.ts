import { Controller, Post, Body, Get, Delete, Param, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/markattendance_dto';
import { MockEnrollDto } from './dto/mockenroll_dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Course } from './course.entity';
import { CreateCourseDto } from './dto/create-course.dto';

@ApiTags('Attendance') 
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Enroll a student (mock/demo purposes)
   * Expects name and registration number in body
   */
  @Post('mock-enroll')
  @ApiOperation({ summary: 'Mock enroll a student' })
  @ApiResponse({ status: 201, description: 'Student enrolled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async mockEnroll(@Body() data: MockEnrollDto) {
    return this.attendanceService.enroll(data.name, data.registrationNumber);
  }

  /**
   * Mark attendance for a specific student
   * Uses registration number from request body
   */
  @Post('mark')
  @ApiOperation({ summary: 'Mark attendance for a student' })
  @ApiResponse({ status: 200, description: 'Attendance marked successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async mark(@Body() dto: MarkAttendanceDto) {
    const updated = await this.attendanceService.markAttendance(dto.registrationNumber);
    return { message: 'Attendance marked', student: updated };
  }

  /**
   * Retrieve all attendance records
   */
  @Get()
  @ApiOperation({ summary: 'Get all attendance records' })
  @ApiResponse({ status: 200, description: 'List of all attendance records' })
  async getRecords() {
    return this.attendanceService.getAttendanceRecords();
  }

  /**
   * Delete a student using their registration number
   */
  @Delete('/deleteStudent/:registrationNumber')
  @ApiOperation({ summary: 'Delete student by registration number' })
  @ApiResponse({ status: 200, description: 'Student deleted successfully' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  async deleteStudent(@Param('registrationNumber') registrationNumber: string) {
    return this.attendanceService.deleteStudent(registrationNumber);
  }

  /**
   * Mark all students as absent (e.g., at start of a new exam day)
   */
  @Get('mark-all-absent')
  @ApiOperation({ summary: 'Mark all students as absent' })
  @ApiResponse({ status: 200, description: 'All students marked as absent' })
  async markAllAbsent() {
    const updatedStudents = await this.attendanceService.markAllAsAbsent();
    return {
      message: `${updatedStudents.students.length} student(s) marked as absent.`,
      students: updatedStudents.students,
    };
  }

  /**
   * Create a new course and associate students using their registration numbers
   */
  @Post('/create-new-courses')
  @ApiOperation({ summary: 'Create a new course with assigned students' })
  @ApiResponse({ status: 201, description: 'Course successfully created', type: Course })
  @ApiBody({ type: CreateCourseDto })
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.attendanceService.createCourseWithStudents(createCourseDto);
  }

  /**
   * Fetch a course by its ID, including all enrolled students
   */
  @Get('/getCourseById/:id')
  @ApiOperation({ summary: 'Get a single course by ID including enrolled students' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the course' })
  @ApiResponse({ status: 200, description: 'Course retrieved', type: Course })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.findCourseWithStudents(id);
  }

  /**
   * Retrieve all courses along with their enrolled students
   */
  @Get('/getAllCourses')
  @ApiOperation({ summary: 'Get all courses with their enrolled students' })
  @ApiResponse({ status: 200, description: 'List of courses retrieved', type: [Course] })
  async findAll() {
    return this.attendanceService.findAllCoursesWithStudents();
  }

  /**
   * Delete one or more courses using an array of IDs
   * Expects body like: { ids: [1, 2, 3] }
   */
  @Delete('/deleteCourse')
  @ApiOperation({ summary: 'Delete one or more courses by their IDs' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'number' },
          example: [1, 2, 3],
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Deleted course IDs' })
  async delete(@Body() body: { ids: number[] }) {
    return this.attendanceService.deleteCourses(body.ids);
  }
}
