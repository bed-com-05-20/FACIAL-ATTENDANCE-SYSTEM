import { ApiProperty } from '@nestjs/swagger';

export class StudentDto {
  @ApiProperty({ example: 'bed-com-05-20', description: 'Unique student registration number' })
  regNumber: string;

  @ApiProperty({ example: 'Rodgers', description: 'First name of the student' })
  firstName: string;

  @ApiProperty({ example: 'Chisale', description: 'Last name of the student' })
  lastName: string;

  @ApiProperty({ example: '4', description: 'Year of study' })
  yearOfStudy: string;

  @ApiProperty({ example: 'Bancellor of Education in Computer Science', description: 'Program of study' })
  programOfStudy: string;

  @ApiProperty({ example: 'Male', description: 'Gender of the student' })
  gender: string;

  @ApiProperty({ example: 'profile.jpg', description: 'Profile picture URL', required: false })
  picture?: string;

  @ApiProperty({ example: 'Absent', description: 'Attendance status', default: 'Absent' })
  attendanceStatus?: string;
}
