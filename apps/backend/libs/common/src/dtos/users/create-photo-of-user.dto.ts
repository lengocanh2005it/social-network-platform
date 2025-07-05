import {
  PhotoType,
  PhotoTypeEnum,
  PostPrivaciesEnum,
  PostPrivaciesType,
} from '@repo/db';
import { IsEnum, IsObject, IsOptional, IsUrl } from 'class-validator';

export class CreatePhotoOfUserDto {
  @IsUrl()
  readonly url!: string;

  @IsEnum(PhotoTypeEnum)
  readonly type!: PhotoType;

  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, any>;

  @IsEnum(PostPrivaciesEnum)
  readonly privacy!: PostPrivaciesType;
}
