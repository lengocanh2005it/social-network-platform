import { CreatePostContentDto } from '@app/common/dtos/posts';
import { CreateCommentTargetType } from '@app/common/utils';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateCommentContentDto extends CreatePostContentDto {}

export class CreateCommentDto {
  @IsOptional()
  @IsUUID('4')
  readonly media_id?: string;

  @IsEnum(CreateCommentTargetType)
  readonly targetType!: CreateCommentTargetType;

  @IsOptional()
  @IsUUID('4')
  readonly parent_comment_id?: string;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreateCommentContentDto)
  @ValidateNested({ each: true })
  readonly contents: CreateCommentContentDto[];
}
