import { redisGet, redisSet } from './../../lib/redis';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type KeydownType = 'Backspace';

export interface UserInfo {
  id: string;
  name: string;
  socketId: string | null;
  thumbnail: string;
  score: number;
  wasExaminer: boolean;
  enteredAt: number;
}

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

  constructor() {
    this.init();
  }

  async init() {
    await redisSet('users', []);
  }

  async handleConnection(socket: Socket) {
    const users = await redisGet<UserInfo[]>('users');
    const user = users.find(user => !user.socketId);
    const socketId = socket.id;

    if (user) {
      user.socketId = socketId;
    }

    socket.to(this.roomName).emit('connection', { data: { users } });
    await redisSet('users', users);
    socket.join(this.roomName);
  }

  async handleDisconnect(socket: Socket) {
    const users = await redisGet<UserInfo[]>('users');
    const remainUsers = users.filter(user => user.socketId !== socket.id);
    await redisSet('users', remainUsers);
    socket
      .to(this.roomName)
      .emit('disconnection', { data: { socketId: socket.id } });
    socket.leave(this.roomName);
  }

  @SubscribeMessage('setSocketInfo')
  async handleSocketInfo(socket: Socket, { userId }: { userId: string }) {
    const users = await redisGet<UserInfo[]>('users');
    const user = users.find(user => user.id === userId);
    user.socketId = socket.id;
    await redisSet('users', users);
    return { data: 'OK' };
  }

  @SubscribeMessage('drawInfo')
  handleChangeMessage(socket: Socket, payload: string) {
    socket.to(this.roomName).emit('draw', { data: payload });
  }

  @SubscribeMessage('keydown')
  handleKeydown(socket: Socket, payload: KeydownType) {
    if (!payload?.includes('Backspace')) return;
    socket.to(this.roomName).emit('keydown', { data: payload });
  }
}
