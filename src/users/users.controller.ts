import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async registerUser(@Body() body: { name: string; faceEmbedding: Buffer }) {
    return this.usersService.registerUser(body.name, body.faceEmbedding);
  }
}
