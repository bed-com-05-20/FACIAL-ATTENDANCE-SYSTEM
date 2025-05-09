import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  InternalServerErrorException,
  Get,
  Logger,
  Delete,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { FaceRecognitionService } from './face-recognition.services';

@Controller('face-recognition')
export class FaceRecognitionController {
  private readonly logger = new Logger(FaceRecognitionController.name);

  constructor(private readonly faceService: FaceRecognitionService) {}

  @Post('detect')
  @UseInterceptors(FileInterceptor('file'))
  async detectFace(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new InternalServerErrorException('No file uploaded.');
    }

    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });

    const tempPath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);
    fs.writeFileSync(tempPath, file.buffer);

    try {
      this.logger.log(`Image saved to ${tempPath}`);

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
          await this.faceService.saveDescriptor({
            descriptor,
            name: 'Unnamed User',
            userId: null,
          });
          this.logger.log('New face saved to database');
        } else {
          this.logger.log(`Face recognized: ${match.name}`);
        }

        recognitionResults.push(match);
      }

      return recognitionResults;
    } catch (error) {
      this.logger.error('Face detection failed', error.stack || error.message);
      throw new InternalServerErrorException('Face detection failed.');
    } finally {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
        this.logger.log(`Deleted temp image: ${tempPath}`);
      }
    }
  }

  @Get('all')
  async getAllDescriptors() {
    try {
      return await this.faceService.getAllDescriptors();
    } catch (error) {
      this.logger.error('Failed to fetch descriptors', error.stack || error.message);
      throw new InternalServerErrorException('Failed to fetch data.');
    }
  }

  @Delete('delete-all')
  async deleteAllDescriptors() {
    try {
      await this.faceService.deleteAllDescriptors();
      return { message: 'All descriptors deleted successfully' };
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete all descriptors');
    }
  }
  
  @Delete(':id')
  async deleteDescriptorById(@Param('id') id: string) {
    try {
      await this.faceService.deleteDescriptorById(id);
      return { message: `Descriptor with ID ${id} deleted successfully` };
    } catch (err) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to delete descriptor');
        }    }

}
