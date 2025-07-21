import { ThemeEnum } from '@repo/db';
import { IsEnum } from 'class-validator';

export class UpdateThemeDto {
  @IsEnum(ThemeEnum)
  readonly theme!: ThemeEnum;
}
