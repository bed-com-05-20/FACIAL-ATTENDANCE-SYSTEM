import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  InternalServerErrorException,
  Logger,
  Get,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { CameraService } from '../camera/camera.service';
import { FaceRecognitionService, RecognitionResult } from './face-recognition.services';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Face Recognition') // Groups routes under "Face Recognition" in Swagger UI
@Controller('face')
export class FaceRecognitionController {
  private readonly logger = new Logger(FaceRecognitionController.name);

  constructor(
    private readonly faceService: FaceRecognitionService,
    private readonly cameraService: CameraService,
  ) {}

  /**
   * Detects and recognizes a face using uploaded image or live camera feed.
   * Saves a new descriptor if the face is not yet registered.
   */
  @Post('detect')
  @ApiOperation({ summary: 'Detect and recognize a face', description: 'Uploads or captures an image, detects the face, and either recognizes the user or saves a new descriptor.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional image file (JPG, PNG)',
        },
        registrationNumber: {
          type: 'string',
          description: 'User registration number',
        },
      },
      required: ['registrationNumber'],
    },
  })
  @ApiResponse({ status: 201, description: 'Face recognized or new descriptor saved.' })
  @ApiResponse({ status: 500, description: 'Face detection failed.' })
  @UseInterceptors(FileInterceptor('file'))
  async detectFace(
    @UploadedFile() file: Express.Multer.File,
    @Body('registrationNumber') registrationNumber: string,
  ) {
    if (!registrationNumber) {
      throw new InternalServerErrorException('Registration number is required.');
    }

    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });

    let tempPath: string | undefined;

    try {
      // Capture from camera if no file is uploaded
      if (!file) {
        const filename = `${Date.now()}.jpg`;
        tempPath = await this.cameraService.captureImage(filename);
      } else {
        // Save uploaded file temporarily
        tempPath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);
        fs.writeFileSync(tempPath, file.buffer);
      }

      // Detect faces and extract descriptors
      const detections = await this.faceService.detectFace(tempPath);
      const recognitionResults: RecognitionResult[] = [];

      for (const { descriptor } of detections) {
        const matches = await this.faceService.recognizeUser([{ descriptor }]);
        const match = matches[0];

        // If not recognized or doesn't match the expected registration number, save new
        if (!match.match || match.registrationNumber !== registrationNumber) {
          await this.faceService.saveDescriptor({ descriptor, registrationNumber });

          this.logger.log(`New descriptor added for registration number: ${registrationNumber}`);
          recognitionResults.push({
            match: true,
            registrationNumber,
            distance: 0,
            attendance: 'New descriptor saved',
          });
        } else {
          // Face was recognized correctly
          this.logger.log(`Face recognized: ${match.registrationNumber}`);
          recognitionResults.push(match);
        }
      }

      return recognitionResults;
    } catch (error) {
      this.logger.error('Face detection failed', error.stack || error.message);
      throw new InternalServerErrorException('Face detection failed.');
    } finally {
      // Clean up temporary image file
      if (tempPath && fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  
   // Deletes all stored face descriptors.
   
  @Delete('all')
  @ApiOperation({ summary: 'Delete all face descriptors' })
  @ApiResponse({ status: 200, description: 'All descriptors deleted successfully.' })
  @ApiResponse({ status: 500, description: 'Failed to delete descriptors.' })
  async deleteAllDescriptors() {
    try {
      await this.faceService.deleteAllDescriptors();
      return { message: 'All descriptors deleted successfully' };
    } catch (err) {
      throw new InternalServerErrorException('Failed to delete all descriptors');
    }
  }

  
   //Retrieves all stored face descriptors from the database.
   
  @Get('all')
  @ApiOperation({ summary: 'Get all face descriptors' })
  @ApiResponse({ status: 200, description: 'List of all descriptors.' })
  @ApiResponse({ status: 500, description: 'Failed to fetch descriptors.' })
  async getAllDescriptors() {
    try {
      return await this.faceService.getAllDescriptors();
    } catch (error) {
      this.logger.error('Failed to fetch descriptors', error.stack || error.message);
      throw new InternalServerErrorException('Failed to fetch data.');
    }
  }
}
