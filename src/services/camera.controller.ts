
import { Controller, Post } from '@nestjs/common';
import { spawn } from 'child_process';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Camera')
@Controller('camera')
export class CameraController {
  
  @Post('start')
  @ApiOperation({ summary: 'Start camera stream' })
  @ApiResponse({ status: 201, description: 'Camera started and sending frames' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async startCamera() {

    const process = spawn('python', ['scripts/capture_send.py']);

    // Listen to stdout from the Python process
    process.stdout.on('data', data => {
      console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', data => {
      console.error(`stderr: ${data}`);
    });

    // Log when the Python process exits
    process.on('close', code => {
      console.log(`Camera process exited with code ${code}`);
    });

    return { message: 'Camera started and sending frames' };
  }
}
