import { IsEnum } from 'class-validator';

export class UpdateAttendanceDto {
  @IsEnum(['Present', 'Absent'])
  attendanceStatus: string;
}
