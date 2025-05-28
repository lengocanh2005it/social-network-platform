import { CreatePostContentDto } from '@app/common/dtos/posts';
import { PostPrivaciesEnum, PostPrivaciesType } from '@repo/db';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreatePostShareDto {
  @IsEnum(PostPrivaciesEnum)
  readonly privacy: PostPrivaciesType;

  @IsOptional()
  @IsUUID('4')
  @IsNotEmpty()
  readonly group_id?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  readonly hashtags?: string[];

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreatePostContentDto)
  @ValidateNested({ each: true })
  readonly contents!: CreatePostContentDto[];
}
