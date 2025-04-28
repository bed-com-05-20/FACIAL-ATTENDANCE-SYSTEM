// import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { FaceRecognitionService } from '../services/face-recognition.services';
// import { diskStorage, Multer } from 'multer';
// //import { diskStorage } from 'multer';
// import { ApiConsumes, ApiBody, ApiTags } from '@nestjs/swagger';


// @Controller('face-recognition')
// export class FaceRecognitionController {
//   constructor(private readonly faceRecognitionService: FaceRecognitionService) {}

//   @Post('detect')
//   @UseInterceptors(FileInterceptor('photo', {
//     storage: diskStorage({
//       destination: './uploads', 
//       filename: (req, file, cb) => {
//         const randomName = Array(4).fill(0).map(i => Math.random().toString
//         (36).charAt(2)).join('');
//       },
 
//     }),
  
//   }))
//   //ApiConsumes('multipart/form-data')
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

//   async detect(@UploadedFile() photo: Express.Multer.File)
//   { 
//     if (!photo) {
//       throw new BadRequestException('No file uploaded');
//     }

//     // Pass the file buffer instead of path
//     const detections = await this.faceRecognitionService.detectFace(photo.buffer);
    
//     return { detections };
//   }
// }

import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FaceRecognitionService } from '../services/face-recognition.services';

@Controller('face-recognition')
export class FaceRecognitionController {
  constructor(private readonly faceRecognitionService: FaceRecognitionService) {}

  @Post()
  async rootPost() {
    return {
      message: "Please use the POST /face-recognition/detect endpoint with multipart/form-data and a file field named 'image'."
    };
  }

  @Post('detect')
  @UseInterceptors(FileInterceptor('image'))
  async detectFace(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded. Please upload an image file with field name "image".');
    }
    const result = await this.faceRecognitionService.detectFace(file.buffer);
    return result;
  }
}
 