import { Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('/login')
  enter() {
    return this.roomsService.enter();
  }
}
