import { PostMediaEnum } from '@app/common/utils';
import { IsEnum } from 'class-validator';

export class LikePostMediaDto {
  @IsEnum(PostMediaEnum)
  readonly type!: PostMediaEnum;
}
