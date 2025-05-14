import {
  IsValidAccessToken,
  IsValidRefreshToken,
} from '@app/common/decorators';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignOutDto {
  @IsValidAccessToken()
  readonly access_token!: string;

  @IsValidRefreshToken()
  readonly refresh_token!: string;

  @IsString()
  @IsNotEmpty()
  readonly finger_print!: string;
}
