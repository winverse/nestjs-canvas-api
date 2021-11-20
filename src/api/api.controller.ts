import { ApiService } from './api.service';
import { Controller, Get } from '@nestjs/common';
import { Post } from '@nestjs/common';

@Controller('/')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get('/users')
  getUsers() {
    return this.apiService.getUsers();
  }

  @Get('/questions')
  getQuestion() {
    return this.apiService.getQuestion();
  }

  @Post('/db')
  clearDB() {
    return this.apiService.clearDB();
  }
}
