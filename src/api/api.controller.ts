import { ApiService } from './api.service';
import { Controller, Get, Render } from '@nestjs/common';

@Controller('/')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  @Render('index')
  getTemplate(): string {
    return this.apiService.getTemplate();
  }
}
