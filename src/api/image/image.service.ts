import { Injectable } from '@nestjs/common';
import DrawCanvasDto from './dto/draw-canvas.dto';
import Canvas from './utils/canvas';

@Injectable()
export class ImageService {
  getHello(): string {
    return 'Hello';
  }

  async drawCanvas(imageData: DrawCanvasDto): Promise<string> {
    const canvas = Canvas.createCanvas(imageData);
    const filepath = await canvas.drawCanvas();
    return filepath;
  }
}
