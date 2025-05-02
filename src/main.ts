import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Import canvas and explicitly type Image and ImageData
import * as canvas from 'canvas';

const { Canvas, Image: CanvasImage, ImageData: CanvasImageData } = canvas;

// Assign to global, casting to `any` to avoid type conflicts
(global as any).Canvas = Canvas;
(global as any).Image = CanvasImage as unknown as new () => HTMLImageElement;
(global as any).ImageData = CanvasImageData as unknown as {
  new (sw: number, sh: number, settings?: ImageDataSettings): ImageData;
  new (data: Uint8ClampedArray, sw: number, sh?: number, settings?: ImageDataSettings): ImageData;
  prototype: ImageData;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Facial Attendance API') // You can combine titles if you want
    .setDescription('API documentation for the Facial Attendance / Face Recognition System')
    .setVersion('1.0')
    .addTag('Face Recognition')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start server
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
