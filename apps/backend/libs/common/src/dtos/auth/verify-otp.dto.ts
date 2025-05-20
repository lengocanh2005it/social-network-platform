import { VerifyOtpActions } from '@app/common/utils';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6)
  readonly otp!: string;

  @IsEnum(VerifyOtpActions)
  readonly action!: VerifyOtpActions;
}
