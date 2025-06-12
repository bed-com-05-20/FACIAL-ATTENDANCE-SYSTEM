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
import { FaceRecognitionService } from './face-recognition.services';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { validate as isUUID } from 'uuid';
import { AttendanceService } from 'src/attendance/attendance.service';

@ApiTags('Face Recognition') 
@Controller('face')
export class FaceRecognitionController {
  [x: string]: any;
  private readonly logger = new Logger(FaceRecognitionController.name);

  constructor(
    private readonly faceService: FaceRecognitionService,
    private readonly cameraService: CameraService,
     private readonly attendanceService: AttendanceService,
  ) {}

  /**
   * @route POST /face/detect
   * @summary Detects face(s) and saves their descriptors using a registration number
   * @description Accepts an uploaded image or captures from a camera. Extracts face descriptors and saves them under the given registration number.
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
      name: { type: 'string', description: 'Optional name of the person' },
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
  @Body('name') name?: string,
) {
  if (!registrationNumber) {
    throw new BadRequestException('Registration number is required.');
  }

  const uploadDir = path.join(__dirname, '..', '..', 'uploads');
  fs.mkdirSync(uploadDir, { recursive: true });

  let tempPath: string | undefined;

  try {
    if (!file) {
      const filename = `${Date.now()}.jpg`;
      tempPath = await this.cameraService.captureImage(filename);
    } else {
      tempPath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);
      fs.writeFileSync(tempPath, file.buffer);
    }

    const detections = await this.faceService.detectFace(tempPath);

    if (detections.length === 0) {
      return {
        message: 'No faces were detected in the image. Please try again with a clearer image.',
        status:"false"
      };
    }

    for (const { descriptor } of detections) {
      await this.faceService.saveDescriptor({ descriptor, registrationNumber });
    }

    // Call the correct method
    await this.attendanceService.enroll(registrationNumber, name || undefined);

    return {
      message: `${detections.length} face(s) detected and descriptor(s) saved`,
      status:"true",
      registrationNumber,
      name: name || null,
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



  /**
   * @route POST /face/recognize
   * @summary Recognizes a face and returns the matched registration number(s)
   * @description Accepts an image upload or live capture, detects face(s), and matches them with stored descriptors
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
      // Capture image if file is not provided
      if (!file) {
        const filename = `${Date.now()}.jpg`;
        tempPath = await this.cameraService.captureImage(filename);
      } else {
        // Save uploaded image
        tempPath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);
        fs.writeFileSync(tempPath, file.buffer);
      }

      // Detect face(s) in the image
      const detections = await this.faceService.detectFace(tempPath);

      if (detections.length === 0) {
        return {
          message: 'No faces were detected for recognition. Ensure your face is clearly visible.',
        };
      }

      // Attempt to match detected descriptors with saved ones
      const recognitionResults = await this.faceService.recognizeUser(detections);

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
      if (tempPath && fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  /**
   * @route DELETE /face/all
   * @summary Deletes all face descriptors from the system
   * @description Clears all stored data related to face recognition
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
   * @route GET /face/all
   * @summary Returns all stored face descriptors
   * @description Useful for debugging or administrative viewing
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
   * @route DELETE /face/:id
   * @summary Deletes a specific face descriptor by UUID
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
