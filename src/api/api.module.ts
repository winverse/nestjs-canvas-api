import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ImageModule } from './image/image.module';

@Module({
  imports: [ImageModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
