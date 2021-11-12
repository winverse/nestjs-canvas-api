import * as path from 'path';
import * as fs from 'fs';

import { createCanvas, loadImage } from 'canvas';
import DrawCanvasDto, { PermissionColors } from '../dto/draw-canvas.dto';

class Canvas {
  private text: string;
  private typeNumber: number;
  private backgroundColor: PermissionColors;

  private constructor(drawData: DrawCanvasDto) {
    const { text, typeNumber, backgroundColor } = drawData;
    this.text = text;
    this.typeNumber = typeNumber;
    this.backgroundColor = backgroundColor;
  }

  static createCanvas(drawData: DrawCanvasDto) {
    return new Canvas(drawData);
  }

  private getBackgroundImagePath(
    typeNumber: number,
    backgroundColor: PermissionColors,
  ): string {
    const backgroundImagePath = path.resolve(
      process.cwd(),
      `./public/images/cover-${backgroundColor}-type${typeNumber}.png`,
    );

    if (!fs.existsSync(backgroundImagePath)) {
      throw new Error('Not found background image');
    }

    return backgroundImagePath;
  }

  private saveCanvas(
    filename: string,
    data: NodeJS.ArrayBufferView,
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const uploadDir = path.resolve(process.cwd(), './public/uploads');

      if (!fs.existsSync(uploadDir)) {
        reject('Not found uploads dir');
        return;
      }

      const filepath = path.resolve(uploadDir, filename);

      await fs.writeFileSync(filepath, data, { encoding: 'utf8' });

      resolve(filepath);
    });
  }

  public async drawCanvas(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const { text, typeNumber, backgroundColor } = this;

      const backgroundImagePath = this.getBackgroundImagePath(
        typeNumber,
        backgroundColor,
      );

      const background = await loadImage(backgroundImagePath);

      const canvas = createCanvas(400, 400);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(background, 400, 400, 400, 400, 0, 0, 400, 400);

      // Draw rectangular
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 60;
      ctx.beginPath();
      ctx.lineTo(0, 40);
      // ctx.lineTo(150, 40);
      // ctx.arc();
      ctx.stroke();

      // save File
      const uploadDir = path.resolve(process.cwd(), './public/uploads');
      const filepath = path.resolve(uploadDir, `${new Date().getTime()}.png`);
      const stream = canvas.createPNGStream();
      const out = fs.createWriteStream(filepath);
      stream.pipe(out);

      out.on('finish', () => {
        resolve(filepath);
      });
    });
  }
}

export default Canvas;
