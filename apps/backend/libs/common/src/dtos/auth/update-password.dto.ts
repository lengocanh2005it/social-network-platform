import { IsEmail } from 'class-validator';
import { IsValidPassword } from 'libs/common/decorators';

export class UpdatePasswordDto {
  @IsEmail()
  readonly email!: string;

  @IsValidPassword()
  readonly password!: string;
}
