import redisClient, { redisGet } from './../lib/redis';
import { UserInfo } from './game/game.gateway';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiService {
  async getUsers(): Promise<{ users: UserInfo }> {
    const users = await redisGet<UserInfo>('users');

    return { users };
  }

  async clearDB() {
    redisClient.FLUSHALL();
    redisClient.FLUSHDB();
    redisClient.flushall();
    redisClient.flushdb();

    return 'OK';
  }
}
