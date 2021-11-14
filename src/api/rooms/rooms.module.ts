import { RoomsController } from './rooms.controller';
import { Module } from '@nestjs/common';
import { RoomsGateway } from './rooms.gateway';
import { RoomsService } from './rooms.service';

@Module({
  controllers: [RoomsController],
  providers: [RoomsGateway, RoomsService],
})
export class RoomsModule {}
