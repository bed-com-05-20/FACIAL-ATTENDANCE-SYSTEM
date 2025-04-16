import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../Entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Register User entity
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Ensure it's exported if used elsewhere
})
export class UsersModule {}
