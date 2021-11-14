import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(8000, {
  path: '/websockets/rooms',
  serverClient: true,
  cors: true,
})
export class RoomsGateway
  implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket>
{
  @WebSocketServer()
  wss: Server;

  async handleConnection() {
    console.log('handleConnection');
  }

  async handleDisconnect() {
    console.log('handleDisconnect');
  }

  @SubscribeMessage('drawInfo')
  handleMessage(client: Socket, payload: string) {
    this.wss.emit('draw', { data: payload });
  }
}
