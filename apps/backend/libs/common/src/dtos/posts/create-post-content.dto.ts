import { PostContentType, PostContentTypeEnum } from '@repo/db';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreatePostContentDto {
  @IsString()
  @IsNotEmpty()
  readonly content!: string;

  @IsEnum(PostContentTypeEnum)
  readonly type: PostContentType;
}
