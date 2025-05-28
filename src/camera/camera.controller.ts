// camera.controller.ts
import { Controller, Get, Query, Res } from '@nestjs/common';
import { CameraService } from './camera.service';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('camera')
export class CameraController {
  constructor(private readonly cameraService: CameraService) {}

  @Get('capture')
  async capture(@Query('filename') filename: string, @Res() res: Response) {
    const filePath = await this.cameraService.captureImage(filename);
    const imageStream = fs.createReadStream(filePath);
    res.setHeader('Content-Type', 'image/jpeg');
    imageStream.pipe(res);
  }
}
