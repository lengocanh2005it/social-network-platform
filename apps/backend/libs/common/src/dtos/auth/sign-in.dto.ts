import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsValidPassword } from 'libs/common/decorators';

export class SignInDto {
  @IsEmail()
  readonly email!: string;

  @IsValidPassword()
  readonly password!: string;

  @IsString()
  @IsNotEmpty()
  readonly fingerprint!: string;
}
