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
  Param,
  NotFoundException,
  BadRequestException,
  
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { CameraService } from '../camera/camera.service';
import { FaceRecognitionService, RecognitionResult } from './face-recognition.services';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { validate as isUUID } from 'uuid';


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
 // 
@Post('detect')
@ApiOperation({ summary: 'Detect and register face (saves descriptor)' })
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: { type: 'string', format: 'binary', description: 'Image file' },
      registrationNumber: { type: 'string', description: 'User registration number' },
    },
    required: ['registrationNumber'], // file is optional now
  },
})
@UseInterceptors(FileInterceptor('file'))
async detectAndRegister(
  @UploadedFile() file: Express.Multer.File,
  @Body('registrationNumber') registrationNumber: string,
) {
  if (!registrationNumber) throw new BadRequestException('Registration number is required.');

  const uploadDir = path.join(__dirname, '..', '..', 'uploads');
  fs.mkdirSync(uploadDir, { recursive: true });

  let tempPath: string | undefined = undefined;  // Initialize as undefined

  try {
    if (!file) {
      // Capture image from camera service if file is missing
      const filename = `${Date.now()}.jpg`;
      tempPath = await this.cameraService.captureImage(filename);
    } else {
      tempPath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);
      fs.writeFileSync(tempPath, file.buffer);
    }

    const detections = await this.faceService.detectFace(tempPath);
    if (detections.length === 0) {
      throw new BadRequestException('No faces detected in the image.');
    }

    for (const { descriptor } of detections) {
      await this.faceService.saveDescriptor({ descriptor, registrationNumber });
    }

    return {
      message: `${detections.length} face(s) detected and descriptor(s) saved`,
      registrationNumber,
    };
  } catch (err) {
    this.logger.error('Detection failed', err.stack || err.message);
    throw new InternalServerErrorException('Face detection failed.');
  } finally {
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}


@Post('recognize')
@ApiOperation({ summary: 'Recognize face and mark attendance' })
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: { type: 'string', format: 'binary', description: 'Optional image file' },
    },
  },
})
@UseInterceptors(FileInterceptor('file'))
async recognizeFace(@UploadedFile() file: Express.Multer.File) {
  const uploadDir = path.join(__dirname, '..', '..', 'uploads');
  fs.mkdirSync(uploadDir, { recursive: true });

  let tempPath: string | undefined = undefined; // Initialize as undefined

  try {
    if (!file) {
      // Capture image from camera service
      const filename = `${Date.now()}.jpg`;
      tempPath = await this.cameraService.captureImage(filename);
    } else {
      // Use uploaded image
      tempPath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);
      fs.writeFileSync(tempPath, file.buffer);
    }

    const detections = await this.faceService.detectFace(tempPath);
    const recognitionResults = await this.faceService.recognizeUser(detections);
    return recognitionResults;
  } catch (err) {
    this.logger.error('Recognition failed', err.stack || err.message);
    throw new InternalServerErrorException('Face recognition failed.');
  } finally {
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



@Delete(':id')
async deleteById(@Param('id') id: string) {
  if (!isUUID(id)) {
    throw new BadRequestException('Invalid UUID format');
  }

  const deleted = await this.faceService.deleteDescriptorById(id);

  if (!deleted) {
    throw new NotFoundException('Descriptor not found');
  }

  return { message: 'Descriptor deleted successfully' };
}
}
