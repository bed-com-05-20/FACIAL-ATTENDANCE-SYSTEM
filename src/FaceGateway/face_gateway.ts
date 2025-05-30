import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  // Enable Cross-Origin Resource Sharing to allow any origin
  cors: {
    origin: '*',
  },
})
export class FaceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // Access the underlying WebSocket server instance (socket.io)
  @WebSocketServer()
  server: Server;

  // Logger for monitoring gateway activity
  private readonly logger = new Logger(FaceGateway.name);

  /**
   * Lifecycle hook triggered when a client connects to the WebSocket server.
   * @param client - The connected socket client
   */
  handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * Lifecycle hook triggered when a client disconnects from the WebSocket server.
   * @param client - The disconnected socket client
   */
  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit a custom event to all connected WebSocket clients.
   * @param event - The name of the event to emit
   * @param payload - The data to send with the event
   */
  emitEvent(event: string, payload: any) {
    this.server.emit(event, payload);
    this.logger.log(`Event emitted: ${event}`);
  }
}
