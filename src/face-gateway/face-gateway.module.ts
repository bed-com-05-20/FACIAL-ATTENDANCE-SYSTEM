// src/gateway/gateway.module.ts
import { Module } from '@nestjs/common';
import { FaceGateway } from 'src/FaceGateway/face_gateway';


@Module({
  providers: [FaceGateway],
  exports: [FaceGateway],
})
export class GatewayModule {}
//haiahjk