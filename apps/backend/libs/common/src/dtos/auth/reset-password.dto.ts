import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidJwt, IsValidPassword } from '@app/common/decorators';
import { config } from 'dotenv';

config();

export class ResetPasswordDto {
  @IsValidPassword()
  readonly newPassword!: string;

  @IsString()
  @IsNotEmpty()
  @IsValidJwt(process.env.JWT_SECRET_KEY || '', {
    message: 'authorizationCode must be a valid signed JWT token.',
  })
  readonly authorizationCode!: string;
}
