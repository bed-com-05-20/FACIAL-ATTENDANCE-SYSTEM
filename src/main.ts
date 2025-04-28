import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

<<<<<<< HEAD
  // Enable CORS (if needed)
  app.enableCors();

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Facial Attendance API')
    .setDescription('API documentation for the Facial Attendance System')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
=======
  const config = new DocumentBuilder()
    .setTitle('Face Recognition API')
    .setDescription('API documentation for face recognition system')
    .setVersion('1.0')
    .addTag('Face Recognition')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
>>>>>>> origin/bed-com-21-20
}

bootstrap();

