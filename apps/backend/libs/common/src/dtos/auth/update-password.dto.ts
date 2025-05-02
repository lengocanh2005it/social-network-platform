import { IsEmail } from 'class-validator';
import { IsValidPassword } from '@app/common/decorators';

export class UpdatePasswordDto {
  @IsEmail()
  readonly email!: string;

  @IsValidPassword()
  readonly password!: string;
}
