
import { Controller, Post } from '@nestjs/common';
import { spawn } from 'child_process';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Camera')
@Controller('camera')
export class CameraController {
  /**
   * Starts the Python camera script to capture and send frames.
   * This assumes you have a Python script located at `scripts/capture_send.py`
   * that handles camera input and potentially sends the data elsewhere (e.g., a socket).
   */
  @Post('start')
  @ApiOperation({ summary: 'Start camera stream' })
  @ApiResponse({ status: 201, description: 'Camera started and sending frames' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async startCamera() {
    // Spawn a Python process to execute the camera capture script
    const process = spawn('python', ['scripts/capture_send.py']);

    // Listen to stdout from the Python process
    process.stdout.on('data', data => {
      console.log(`stdout: ${data}`);
    });

    // Listen to stderr for errors from the Python script
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
