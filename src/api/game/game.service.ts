import { redisGet, redisSet } from '../../lib/redis';
import { UserInfo } from './game.gateway';
import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import Utils from 'lib/utils';

export interface QuestionInfoType {
  examiner: UserInfo | null;
  question: string | null;
}

@Injectable()
export class GameService {
  async enterTheGame() {
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

  async getQuestionInfo() {
    let questionInfo: QuestionInfoType = await redisGet('questionInfo');

    // Is mean first user enter the room OR Needs intialize question info
    if (!questionInfo?.examiner || !questionInfo?.question) {
      questionInfo = {
        examiner: null,
        question: null,
      };

      const users = await redisGet<UserInfo[]>('users');

      questionInfo.examiner = users
        .filter(user => !user.wasExaminer)
        .sort((a, b) => b.enteredAt - a.enteredAt)[0];

      const questions = ['소방관']; // Add question something...
      // const randomNumber = Utils.randomNumber(questions.length);
      const question: string = questions[0];

      questionInfo.question = question;
      await redisSet('questionInfo', questionInfo);
    }

    return { payload: questionInfo };
  }
}
