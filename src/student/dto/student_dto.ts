import { ApiProperty } from '@nestjs/swagger';

export class StudentDto {
  @ApiProperty({ example: 'bed-com-10-20', description: 'Unique registration number' })
  registrationNumber: string;
  @ApiProperty({ example: 'bheki makupe', description: 'Full name of the student' })
  name: string;
}
