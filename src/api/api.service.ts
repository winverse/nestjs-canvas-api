import redisClient, { redisGet } from './../lib/redis';
import { UserInfo } from './rooms/rooms.gateway';
import { Injectable } from '@nestjs/common';
import Utils from 'lib/utils';

@Injectable()
export class ApiService {
  async getUsers(): Promise<{ users: UserInfo }> {
    const users = await redisGet<UserInfo>('users');

    return { users };
  }

  getQuestion(): { question: string } {
    const questions = ['소방관'];
    // const randomNumber = Utils.randomNumber(questions.length);
    return { question: questions[0] };
  }

  async clearDB() {
    redisClient.FLUSHALL();
    redisClient.FLUSHDB();
    redisClient.flushall();
    redisClient.flushdb();

    return 'OK';
  }
}
