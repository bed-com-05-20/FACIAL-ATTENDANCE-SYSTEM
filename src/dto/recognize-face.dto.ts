// recognize-face.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class RecognizeFaceDto {
  @ApiProperty()
  id: number;
  @ApiProperty({ required: false, description: 'Optional image file' })
  file?: any;

  @ApiProperty({ required: false, description: 'Exam session ID if already created' })
  examSessionId?: number;

  @ApiProperty({ required: false, description: 'Course code for auto-creating a session (e.g., MATT211)' })
  courseCode?: string;

  @ApiProperty({ required: false, description: 'Course name for auto-creating a session' })
  courseName?: string;
}
