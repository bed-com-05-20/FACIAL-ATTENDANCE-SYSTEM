import { ApiProperty } from '@nestjs/swagger';

export class MarkAttendanceDto {
  @ApiProperty()
  registrationNumber: string;
  
}
