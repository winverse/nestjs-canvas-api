import { redisGet, redisSet } from './../../lib/redis';
import { UserInfo } from './rooms.gateway';
import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';

@Injectable()
export class RoomsService {
  async enter() {
    const users: UserInfo[] = (await redisGet('users')) || [];

    const loggedUser = {
      id: nanoid(),
      name: `회원_${users.length}`,
      socketId: null,
    };

    users.push(loggedUser);
    await redisSet('users', users);
    return { loggedUser };
  }
}
