import { IsValidJwt, IsValidPassword } from '@app/common/decorators';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly currentPassword!: string;

  @IsValidPassword()
  readonly newPassword!: string;
}
