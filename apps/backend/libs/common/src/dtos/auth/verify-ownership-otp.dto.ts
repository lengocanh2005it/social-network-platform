import { VerifyOwnershipOtpMethodEnum } from '@app/common/utils';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';

export class VerifyOwnershipOtpDto {
  @IsEnum(VerifyOwnershipOtpMethodEnum)
  readonly method: VerifyOwnershipOtpMethodEnum;

  @IsString()
  @Length(6)
  readonly otp: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  readonly phone_number?: string;
}
