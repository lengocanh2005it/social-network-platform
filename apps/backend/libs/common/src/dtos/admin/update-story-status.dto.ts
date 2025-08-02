import { StoryStatusEnum } from '@repo/db';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateStoryStatusDto {
  @IsEnum(StoryStatusEnum)
  readonly status!: StoryStatusEnum;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly reason?: string;
}
