import { IsEnum, IsNumber, IsString } from 'class-validator';

export enum PermissionColors {
  BLUE = 'blue',
  GREEN = 'green',
}

class DrawCanvasDto {
  @IsNumber()
  readonly typeNumber: number;

  @IsEnum(PermissionColors)
  readonly backgroundColor: PermissionColors;

  @IsString()
  readonly text: string;
}

export default DrawCanvasDto;
