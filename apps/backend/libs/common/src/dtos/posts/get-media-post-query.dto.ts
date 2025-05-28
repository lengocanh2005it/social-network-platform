import { PostMediaEnum } from '@app/common/utils';
import { IsEnum } from 'class-validator';

export class GetMediaPostQueryDto {
  @IsEnum(PostMediaEnum)
  readonly type!: PostMediaEnum;
}
