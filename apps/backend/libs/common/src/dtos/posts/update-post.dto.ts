import {
  CreatePostContentDto,
  CreatePostImageDto,
  CreatePostVideoDto,
} from '@app/common/dtos/posts';
import {
  PostContentTypeEnum,
  PostPrivaciesEnum,
  PostPrivaciesType,
} from '@repo/db';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class DeletedMediaDto {
  @IsUrl()
  readonly url!: string;

  @IsIn(['image', 'video'])
  readonly type!: 'image' | 'video';
}

export class UpdatePostContentDto {
  @IsOptional()
  @IsString()
  readonly content?: string;

  @IsOptional()
  @IsEnum(PostContentTypeEnum)
  readonly type?: PostContentTypeEnum;
}

export class UpdatePostDto {
  @IsEnum(PostPrivaciesEnum)
  readonly privacy: PostPrivaciesType;

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
  @Type(() => CreatePostContentDto)
  @ValidateNested({ each: true })
  readonly contents?: CreatePostContentDto[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreatePostVideoDto)
  @ValidateNested({ each: true })
  readonly videos?: CreatePostVideoDto[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DeletedMediaDto)
  @IsNotEmpty()
  readonly deletedMediaDto?: DeletedMediaDto[];
}
