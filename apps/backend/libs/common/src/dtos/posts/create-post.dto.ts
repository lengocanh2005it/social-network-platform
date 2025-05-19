import {
  CreatePostContentDto,
  CreatePostImageDto,
  CreatePostVideoDto,
} from '@app/common/dtos/posts';
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

export class CreatePostDto {
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

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  readonly tags?: string[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreatePostImageDto)
  @ValidateNested({ each: true })
  readonly images?: CreatePostImageDto[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreatePostContentDto)
  @ValidateNested({ each: true })
  readonly contents?: CreatePostContentDto[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreatePostVideoDto)
  @ValidateNested({ each: true })
  readonly videos?: CreatePostVideoDto[];
}
