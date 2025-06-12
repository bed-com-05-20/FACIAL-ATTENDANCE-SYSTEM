import { ApiProperty } from "@nestjs/swagger";

// dto/mock-enroll.dto.ts
export class MockEnrollDto {
    @ApiProperty()
    name: string;
    @ApiProperty()
    registrationNumber: string;
  }
  