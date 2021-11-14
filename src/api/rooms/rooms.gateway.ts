import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type KeydownType = 'Backspace';

@WebSocketGateway(8000, {
  path: '/websockets/rooms',
  serverClient: true,
  cors: true,
  namespace: '/',
})
export class RoomsGateway
  implements OnGatewayConnection<Socket>, OnGatewayDisconnect<Socket>
{
  @WebSocketServer()
  wss: Server;

  roomName = 'room';

  async handleConnection(socket: Socket) {
    socket.join(this.roomName);
    console.log('handleConnection');
  }

  async handleDisconnect(socket: Socket) {
    socket.leave(this.roomName);
  }

  @SubscribeMessage('drawInfo')
  handleMessage(socket: Socket, payload: string) {
    socket.to(this.roomName).emit('draw', { data: payload });
  }

  @SubscribeMessage('keydown')
  handleKeydown(socket: Socket, payload: KeydownType) {
    if (!payload?.includes('Backspace')) return;
    socket.to(this.roomName).emit('keydown', { data: payload });
  }
}
