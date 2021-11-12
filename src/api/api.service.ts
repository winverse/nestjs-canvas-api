import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiService {
  getTemplate(): string {
    return 'hello';
  }
}
