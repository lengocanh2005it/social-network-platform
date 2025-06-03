import { ToBoolean } from '@app/common/decorators';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetUserQueryDto {
  @IsString()
  @IsNotEmpty()
  readonly username!: string;

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
