import { Controller, Get, Query, Res, Post, BadRequestException } from '@nestjs/common';
import { CameraService } from './camera.service';
import { Response } from 'express';
import * as fs from 'fs';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Camera')
@Controller('camera')
export class CameraController {
  constructor(private readonly cameraService: CameraService) {}

  /**
   * GET /camera/capture
   * Captures a single image from the Raspberry Pi and returns it.
   */
  @Get('capture')
  @ApiOperation({ summary: 'Capture a single image from Raspberry Pi camera' })
  @ApiQuery({
    name: 'filename',
    required: true,
    description: 'The filename to assign to the captured image (e.g., photo.jpg)',
  })
  @ApiResponse({ status: 200, description: 'Returns the captured image as JPEG' })
  @ApiResponse({ status: 500, description: 'Failed to capture or send image' })
  async capture(@Query('filename') filename: string, @Res() res: Response) {
    const filePath = await this.cameraService.captureImage(filename);
    const imageStream = fs.createReadStream(filePath);
    res.setHeader('Content-Type', 'image/jpg');
    imageStream.pipe(res);
  }

  /**
   * POST /camera/start
   * Starts camera auto-capturing for a given duration (in seconds).
   */
  @Post('start')
  @ApiOperation({ summary: 'Start continuous image capture for N seconds' })
  @ApiQuery({
    name: 'duration',
    required: true,
    description: 'How many seconds to capture images',
  })
  async startCapture(@Query('duration') duration: number) {
    if (!duration || duration <= 0) {
      throw new BadRequestException('Duration must be a positive number');
    }

    await this.cameraService.startTimedCapture(duration);
    return { message: `Camera started for ${duration} seconds` };
  }
}
