import { ContentStoryType, ContentStoryTypeEnum } from '@repo/db';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateStoryDto {
  @IsEnum(ContentStoryTypeEnum)
  readonly content_type!: ContentStoryType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly content_url?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly text_content?: string;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => {
    if (!value) return undefined;

    if (value instanceof Date) return value;

    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date;
    }

    return undefined;
  })
  readonly expires_at!: Date;
}
