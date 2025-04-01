import { ApiProperty } from '@nestjs/swagger';

export class MarkAttendanceDto {
  @ApiProperty()
  regNumber: string;

  @ApiProperty()
  status: 'Present' | 'Absent';
}
