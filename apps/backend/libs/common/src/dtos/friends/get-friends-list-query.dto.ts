import { FriendListType } from '@app/common/utils';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class GetFriendsListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly limit?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly after?: string;

  @IsString()
  @IsNotEmpty()
  readonly username!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly full_name?: string;

  @IsEnum(FriendListType)
  readonly type!: FriendListType;
}
