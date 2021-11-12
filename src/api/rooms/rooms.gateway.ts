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
  path: '/websockets',
  serverClient: true,
  namespace: '/',
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

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: string): WsResponse<string> {
    return { event: 'msgToClient', data: payload };
  }
}
