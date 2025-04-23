import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6)
  readonly otp!: string;
}
