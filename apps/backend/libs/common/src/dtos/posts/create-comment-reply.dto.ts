import { CreateCommentContentDto } from '@app/common/dtos/posts';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';

export class CreateCommentReplyDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreateCommentContentDto)
  @ValidateNested({ each: true })
  readonly contents: CreateCommentContentDto[];
}
