import { GameController } from './game.controller';
import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  controllers: [GameController],
  providers: [GameGateway, GameService],
})
export class GameModule {}
