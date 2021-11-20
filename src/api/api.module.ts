import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [GameModule, ChatModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
