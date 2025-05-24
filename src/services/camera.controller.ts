import { Controller, Post } from '@nestjs/common';
import { spawn } from 'child_process';

@Controller('camera')
export class CameraController {
  @Post('start')
  async startCamera() {
    const process = spawn('python', ['scripts/capture_send.py']);

    process.stdout.on('data', data => {
      console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', data => {
      console.error(`stderr: ${data}`);
    });

    process.on('close', code => {
      console.log(`Camera process exited with code ${code}`);
    });

    return { message: 'Camera started and sending frames' };
  }
}
