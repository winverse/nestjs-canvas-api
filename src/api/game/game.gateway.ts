import { redisDel, redisGet, redisSet } from '../../lib/redis';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { QuestionInfoType } from './game.service';

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
  path: '/websockets/games',
  serverClient: true,
  cors: true,
  namespace: '/',
})
export class GameGateway
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
    socket.join(this.roomName);
    const users = await redisGet<UserInfo[]>('users');
    const user = users.find(user => !user.socketId);
    const socketId = socket.id;

    if (user) {
      user.socketId = socketId;
    }

    socket.to(this.roomName).emit('connection', { data: { users } });
    await redisSet('users', users);
  }

  async handleDisconnect(socket: Socket) {
    const users = await redisGet<UserInfo[]>('users');
    const questionInfo = await redisGet<QuestionInfoType>('questionInfo');
    const remainUsers = users.filter(user => user.socketId !== socket.id);
    const leave = users.find(user => user.socketId === socket.id);
    await redisSet('users', remainUsers);

    if (leave) {
      socket.to(this.roomName).emit('disconnection', { data: { remainUsers } });
    }

    if (remainUsers.length === 0) {
      await redisDel('questionInfo');
    }

    if (questionInfo?.examiner?.id === leave?.id && remainUsers.length > 0) {
      await redisDel('questionInfo');
      socket.to(this.roomName).emit('needsInitQuestionInfo');
    }

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

  @SubscribeMessage('initQuestionInfo')
  async handleExaminer(socket: Socket, payload: QuestionInfoType) {
    socket.to(this.roomName).emit('initQuestionInfo', { data: payload });
    const users = await redisGet<UserInfo[]>('users');
    const user = users.find(user => user.id === payload.examiner.id);

    if (user) {
      user.wasExaminer = true;
    }

    await redisSet('questionInfo', payload);
    await redisSet('users', users);
  }

  @SubscribeMessage('gameStart')
  async handleGameStart(socket: Socket) {
    socket.to(this.roomName).emit('gameStart');
  }

  @SubscribeMessage('gameEnd')
  async handleGameEnd(socket: Socket, payload: { userId: string }) {
    socket.to(this.roomName).emit('gameEnd', { data: payload });
  }
}
