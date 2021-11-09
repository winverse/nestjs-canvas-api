import * as path from 'path';
import * as fs from 'fs';

import { Injectable, NotFoundException } from '@nestjs/common';
import DrawCanvasDto from './dto/draw-canvas.dto';

@Injectable()
export class ImageService {
  getHello(): string {
    return 'Hello';
  }

  drawCanvas(imageData: DrawCanvasDto): string {
    const { text, typeNumber, backgroundColor } = imageData;

    console.log(__dirname);

    const backgroundImagePath = path.resolve(
      process.cwd(),
      `./images/cover-${backgroundColor}-type${typeNumber}.png`,
    );

    if (!fs.existsSync(backgroundImagePath)) {
      throw new NotFoundException('Not found background image');
    }

    return 'drawCanvas';
  }
}
