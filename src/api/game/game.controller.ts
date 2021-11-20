import { Post, Get } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('/games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('/login')
  enter() {
    return this.gameService.enter();
  }

  @Get('/questions')
  getQuestion() {
    return this.gameService.getQuestion();
  }

  @Get('/examiners')
  getExaminers() {
    return this.gameService.getExaminers();
  }
}
