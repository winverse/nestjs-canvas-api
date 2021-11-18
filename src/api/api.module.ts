import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

import { RoomsModule } from './rooms/rooms.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [RoomsModule, ChatModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
