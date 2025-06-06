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
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { validate as isUUID } from 'uuid';

@ApiTags('Face Recognition') // Groups routes under "Face Recognition" in Swagger
@Controller('face')
export class FaceRecognitionController {
  private readonly logger = new Logger(FaceRecognitionController.name);

  constructor(
    private readonly faceService: FaceRecognitionService,
    private readonly cameraService: CameraService,
  ) {}

  /**
   * Detect and register face descriptors.
   * Accepts an uploaded image file or captures from camera if no file is sent.
   * Stores descriptors with a user-provided registration number.
   */
  @Post('detect')
  @ApiOperation({ summary: 'Detect and register face (saves descriptor)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Optional image file' },
        registrationNumber: { type: 'string', description: 'User registration number' },
      },
      required: ['registrationNumber'],
    },
  })
  @ApiResponse({ status: 201, description: 'Face detected and descriptor saved' })
  @ApiResponse({ status: 400, description: 'No faces detected or registration number missing' })
  @ApiResponse({ status: 500, description: 'Face detection failed' })
  @UseInterceptors(FileInterceptor('file'))
  async detectAndRegister(
    @UploadedFile() file: Express.Multer.File,
    @Body('registrationNumber') registrationNumber: string,
  ) {
    if (!registrationNumber) {
      throw new BadRequestException('Registration number is required.');
    }

    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });

    let tempPath: string | undefined;

    try {
      // If file not provided, capture image from Raspberry Pi camera
      if (!file) {
        const filename = `${Date.now()}.jpg`;
        tempPath = await this.cameraService.captureImage(filename);
      } else {
        // Save uploaded file to temporary path
        tempPath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);
        fs.writeFileSync(tempPath, file.buffer);
      }

      const detections = await this.faceService.detectFace(tempPath);

      // Return user-friendly message if no faces detected
      if (detections.length === 0) {
        return {
          message: 'No faces were detected in the image. Please try again with a clearer image.',
        };
      }

      // Save descriptors for each face detected
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
      // Clean up temporary file
      if (tempPath && fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  /**
   * Recognize face from uploaded image or live capture.
   * Returns matching registration numbers or user-friendly message if no match.
   */
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
  @ApiResponse({ status: 200, description: 'Recognition results returned' })
  @ApiResponse({ status: 500, description: 'Face recognition failed' })
  @UseInterceptors(FileInterceptor('file'))
  async recognizeFace(@UploadedFile() file: Express.Multer.File) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });

    let tempPath: string | undefined;

    try {
      // Capture from camera if no file uploaded
      if (!file) {
        const filename = `${Date.now()}.jpg`;
        tempPath = await this.cameraService.captureImage(filename);
      } else {
        // Save uploaded image
        tempPath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);
        fs.writeFileSync(tempPath, file.buffer);
      }

      const detections = await this.faceService.detectFace(tempPath);

      // If no faces found, inform user clearly
      if (detections.length === 0) {
        return {
          message: 'No faces were detected for recognition. Ensure your face is clearly visible.',
        };
      }

      const recognitionResults = await this.faceService.recognizeUser(detections);

      // If no matches found, return helpful message
      if (recognitionResults.length === 0) {
        return {
          message: 'Face not recognized. No match found in the system.',
        };
      }

      return recognitionResults;
    } catch (err) {
      this.logger.error('Recognition failed', err.stack || err.message);
      throw new InternalServerErrorException('Face recognition failed.');
    } finally {
      // Delete temp file
      if (tempPath && fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  /**
   * Deletes all stored face descriptors.
   */
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

  /**
   * Returns all stored face descriptors.
   */
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

  /**
   * Delete a specific face descriptor by UUID.
   * @param id UUID of the descriptor to delete
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete descriptor by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the descriptor', required: true })
  @ApiResponse({ status: 200, description: 'Descriptor deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format' })
  @ApiResponse({ status: 404, description: 'Descriptor not found' })
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
