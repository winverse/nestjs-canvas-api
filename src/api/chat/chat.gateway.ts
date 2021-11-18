import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway(8001, {
  path: '/websockets/chat',
  serveClient: true,
  cors: true,
  namespace: '/',
})
export class ChatGateway
  implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket>
{
  @WebSocketServer()
  wss: Server;

  handleConnection(socket: Socket) {
    console.log('connected');
  }

  handleDisconnect(socket: Socket) {
    console.log('disconnected');
  }
}
