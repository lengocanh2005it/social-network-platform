import { IsEmail, IsIn, IsOptional, IsPhoneNumber } from 'class-validator';

export class SendOtpDto {
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  readonly phone_number?: string;

  @IsIn(['email', 'sms'])
  readonly method!: 'email' | 'sms';

  @IsIn(['update', 'verify'])
  readonly type!: 'update' | 'verify';
}
