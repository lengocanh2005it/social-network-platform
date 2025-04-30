import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsValidPassword } from 'libs/common/decorators';

export class SignInDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  @IsNotEmpty()
  readonly password!: string;

  @IsString()
  @IsNotEmpty()
  readonly fingerprint!: string;
}
