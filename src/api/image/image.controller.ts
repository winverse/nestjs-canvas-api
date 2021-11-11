import { Body, Controller, Get, Post } from '@nestjs/common';
import DrawCanvasDto from './dto/draw-canvas.dto';
import { ImageService } from './image.service';

@Controller('/image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get()
  getHello(): string {
    return this.imageService.getHello();
  }

  @Post()
  drawCanvas(@Body() imageData: DrawCanvasDto): Promise<string> {
    return this.imageService.drawCanvas(imageData);
  }
}
