import { ApiService } from './api.service';
import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  getTemplate(): string {
    return this.apiService.getTemplate();
  }
}
