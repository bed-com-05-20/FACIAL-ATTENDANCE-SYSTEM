import { Controller, Get, Query, Res } from '@nestjs/common';
import { CameraService } from './camera.service';
import { Response } from 'express';
import * as fs from 'fs';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Camera') // Group this controller under 'Camera' in Swagger UI
@Controller('camera')
export class CameraController {
  constructor(private readonly cameraService: CameraService) {}

  /**
   * Capture an image using the Raspberry Pi camera and return it as a JPEG response.
   * 
   * @param filename - The filename to save the captured image as.
   * @param res - Express response object to stream the image back.
   */
  @Get('capture')
  @ApiOperation({ summary: 'Capture image from Raspberry Pi camera' })
  @ApiQuery({
    name: 'filename',
    required: true,
    description: 'The filename to assign to the captured image (e.g., photo.jpg)',
  })
  @ApiResponse({ status: 200, description: 'Returns the captured image as JPEG' })
  @ApiResponse({ status: 500, description: 'Failed to capture or send image' })
  async capture(@Query('filename') filename: string, @Res() res: Response) {
    // Capture the image and get the path to the saved file
    const filePath = await this.cameraService.captureImage(filename);

    // Create a readable stream to pipe the image into the response
    const imageStream = fs.createReadStream(filePath);

    // Set the appropriate content type for a JPEG image
    res.setHeader('Content-Type', 'image/jpeg');

    // Pipe the image stream directly to the response
    imageStream.pipe(res);
  }
}
