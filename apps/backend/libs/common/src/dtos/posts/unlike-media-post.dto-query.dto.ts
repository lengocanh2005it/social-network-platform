import { PostMediaEnum } from '@app/common/utils';
import { IsEnum } from 'class-validator';

export class UnlikeMediaPostQueryDto {
  @IsEnum(PostMediaEnum)
  readonly type!: PostMediaEnum;
}
