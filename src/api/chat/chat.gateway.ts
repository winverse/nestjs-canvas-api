import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

interface receviedMessage {
  name: string;
  message: string;
  thumbnail: string;
  createdAt: string;
}

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

  roomName = 'chat';

  handleConnection(socket: Socket) {
    socket.join(this.roomName);
  }

  handleDisconnect(socket: Socket) {
    socket.leave(this.roomName);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(socket: Socket, payload: receviedMessage) {
    socket.broadcast
      .to(this.roomName)
      .emit('receviedMessage', { data: payload });
  }
}
