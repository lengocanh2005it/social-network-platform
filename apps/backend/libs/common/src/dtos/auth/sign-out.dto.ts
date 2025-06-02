import {
  IsValidAccessToken,
  IsValidRefreshToken,
} from '@app/common/decorators';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignOutDto {
  @IsOptional()
  @IsValidAccessToken()
  readonly access_token?: string;

  @IsOptional()
  @IsValidRefreshToken()
  readonly refresh_token?: string;

  @IsString()
  @IsNotEmpty()
  readonly finger_print!: string;

  @IsString()
  @IsNotEmpty()
  readonly user_id!: string;
}
