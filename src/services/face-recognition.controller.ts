import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { FaceRecognitionService } from './face-recognition.services';

@Controller('face-recognition')
export class FaceRecognitionController {
  constructor(private readonly faceService: FaceRecognitionService) {}

  @Post('detect')
@UseInterceptors(FileInterceptor('file'))
async detectFace(@UploadedFile() file: Express.Multer.File) {
  if (!file) {
    throw new InternalServerErrorException('No file uploaded.');
  }

  const uploadDir = path.join(__dirname, '..', '..', 'uploads');
  fs.mkdirSync(uploadDir, { recursive: true });

  const tempPath = path.join(uploadDir, file.originalname);
  fs.writeFileSync(tempPath, file.buffer);

  try {
    const detections = await this.faceService.detectFace(tempPath);

    const recognitionResults: {
      match: boolean;
      name: string;
      userId: string | null;
      distance: number;
    }[] = [];
    

    for (const { descriptor } of detections) {
      const matches = await this.faceService.recognizeUser([{ descriptor }]);

      const match = matches[0];

      if (!match.match) {
        // Save new descriptor
        await this.faceService.saveDescriptor({
          descriptor,
          name: 'Unnamed User',
          userId: null,
        });
      }

      recognitionResults.push(match);
    }

    return recognitionResults;
  } catch (err) {
    throw new InternalServerErrorException('Face detection failed.');
  }
}

}