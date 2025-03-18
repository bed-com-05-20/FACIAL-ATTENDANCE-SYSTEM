import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Student } from 'src/attendance/student.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student])],  // Register the Student entity
  providers: [StudentService],
  controllers: [StudentController],
  exports: [StudentService],  // Export service for use in other modules if needed
})
export class StudentModule {}
