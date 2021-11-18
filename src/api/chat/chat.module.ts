import { ChatGateway } from './chat.gateway';

import { Module } from '@nestjs/common';

@Module({
  controllers: [],
  providers: [ChatGateway],
})
export class ChatModule {}
