import { UploadUserImageTypeEnum } from '@app/common/utils';
import { IsEnum } from 'class-validator';

export class UploadUserImageQueryDto {
  @IsEnum(UploadUserImageTypeEnum)
  readonly type!: UploadUserImageTypeEnum;
}
