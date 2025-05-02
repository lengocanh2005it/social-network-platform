import { ToBoolean } from '@app/common/decorators';
import { IsBoolean, IsOptional } from 'class-validator';

export class GetUserQueryDto {
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  readonly includeFollowings?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  readonly includeGroups?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  readonly includeProfile?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  readonly includeWorkPlaces?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  readonly includeTargets?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  readonly includeEducations?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  readonly includeSocials?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  readonly includePosts?: boolean;
}
