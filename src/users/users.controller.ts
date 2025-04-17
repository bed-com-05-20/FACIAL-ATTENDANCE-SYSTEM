// import { Controller, Post, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { UsersService } from './users.service';
// import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';

// @ApiTags('users')
// @Controller('users')
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Post('register')
//   @UseInterceptors(FileInterceptor('photo', {
//     storage: diskStorage({
//       destination: './uploads', // or wherever you want to store temporarily
//       filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         cb(null, `${uniqueSuffix}-${file.originalname}`);
//       },
//     }),
//   }))
//   @ApiConsumes('multipart/form-data')
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         name: { type: 'string' },
//         photo: {
//           type: 'string',
//           format: 'binary',
//         },
//       },
//     },
//   })
//   async registerUser(
//     @Body() body: { name: string },
//     @UploadedFile() photo: Express.Multer.File,
//   ) {
//     return this.usersService.registerUser(body.name, photo.path);
//   }
// }

import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads', // where to save uploaded images
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async registerUser(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
  ) {
    if (!file) {
      throw new Error('Photo file is required!');
    }
    return this.usersService.registerUser(name, file.path);
  }
}
