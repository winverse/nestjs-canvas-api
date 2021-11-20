import { redisGet, redisSet } from '../../lib/redis';
import { UserInfo } from './game.gateway';
import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import Utils from 'lib/utils';

export interface RedisExaminerType {
  examiner: UserInfo | null;
  question: string | null;
}

@Injectable()
export class GameService {
  async enter() {
    const names = [
      'Eleanor Pena',
      'Leslie Alexandar',
      'Brooklyn Simmons',
      'Arlene McCoy',
      'Jerome Bell',
      'Darlene Robertson',
      'Kathryn Murphy',
      'Theresa Webb',
      'Darrerll Steward',
      'Kylian Mbappe',
      'David Alaba',
      'Sergio Ramos',
      'Thibaut Courtois',
    ];

    const users: UserInfo[] = (await redisGet('users')) || [];

    const randomNumber = Utils.randomNumber(13);
    const thumbnailUrl = `http://localhost:3000/thumbnails/thumbnail_${randomNumber}.png`;
    const name = names[Utils.randomNumber(13)];
    const loggedUser = {
      id: nanoid(),
      name,
      socketId: null,
      thumbnail: thumbnailUrl,
      score: 0,
      wasExaminer: false,
      enteredAt: new Date().getTime(),
    };

    users.push(loggedUser);
    await redisSet('users', users);
    return { loggedUser };
  }

  getQuestion(): { question: string } {
    const questions = ['소방관'];
    // const randomNumber = Utils.randomNumber(questions.length);
    return { question: questions[0] };
  }

  async getExaminers() {
    const examinerInfo: RedisExaminerType = await redisGet('examiner');

    // Is mean first user enter the room;
    if (!examinerInfo.examiner || !examinerInfo.question) {
      const user = await redisGet<UserInfo>('users');
      examinerInfo.examiner = user[0];
      const { question } = this.getQuestion();
      examinerInfo.question = question;
      await redisSet('examiner', examinerInfo);
    }

    return { payload: examinerInfo };
  }
}
