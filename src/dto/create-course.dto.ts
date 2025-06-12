import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  room: string;


 @ApiProperty()
  @IsString()
  @IsNotEmpty()
  supervisor: string;


 @ApiProperty()
  @IsString()
  @IsNotEmpty()
  examName: string;


 @ApiProperty()
  @IsString()
  @IsNotEmpty()
  date: string;



  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endTime: string;

 
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @Type(()=>String)
  studentIds: string[];
}