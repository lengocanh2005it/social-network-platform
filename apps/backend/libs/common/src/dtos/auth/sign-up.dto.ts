import { IsValidPassword } from '@app/common/decorators';
import { TransformToDate } from '@app/common/transformers';
import { GenderEnum } from '@repo/db';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class DeviceDetailsDto {
  @IsString()
  @IsNotEmpty()
  readonly device_name!: string;

  @IsString()
  @IsNotEmpty()
  readonly user_agent!: string;

  @IsString()
  @IsNotEmpty()
  readonly ip_address!: string;

  @IsString()
  @IsNotEmpty()
  readonly location!: string;
}

export class SignUpDto {
  @IsEmail()
  readonly email!: string;

  @IsValidPassword()
  readonly password!: string;

  @IsPhoneNumber('VN')
  readonly phone_number!: string;

  @IsEnum(GenderEnum)
  readonly gender!: GenderEnum;

  @IsNotEmpty()
  @IsDate()
  @TransformToDate()
  readonly dob!: Date;

  @IsString()
  @IsNotEmpty()
  readonly address!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly bio?: string;

  @IsString()
  @IsNotEmpty()
  readonly first_name!: string;

  @IsString()
  @IsNotEmpty()
  readonly last_name!: string;

  @IsString()
  @IsNotEmpty()
  readonly finger_print!: string;

  @ValidateNested()
  @Type(() => DeviceDetailsDto)
  @IsNotEmpty()
  readonly deviceDetailsDto!: DeviceDetailsDto;

  @IsString()
  @IsNotEmpty()
  readonly captchaToken!: string;

  @IsString()
  @IsNotEmpty()
  readonly username!: string;
}
