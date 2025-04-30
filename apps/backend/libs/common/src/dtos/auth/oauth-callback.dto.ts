import { DeviceDetailsDto } from '@app/common/dtos/auth';
import { Gender } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import {
  IsValidAccessToken,
  IsValidRefreshToken,
} from 'libs/common/decorators';

export class OAuthCallbackDto {
  @IsValidAccessToken()
  readonly access_token!: string;

  @IsValidRefreshToken()
  readonly refresh_token!: string;

  @IsString()
  @IsNotEmpty()
  readonly address!: string;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => {
    if (!value) return undefined;

    if (value instanceof Date) return value;

    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date;
    }

    return undefined;
  })
  readonly dob!: Date;

  @IsString()
  @IsNotEmpty()
  readonly finger_print!: string;

  @IsEnum(Gender)
  readonly gender!: Gender;

  @IsPhoneNumber('VN')
  @IsNotEmpty()
  readonly phone_number!: string;

  @ValidateNested()
  @Type(() => DeviceDetailsDto)
  @IsNotEmpty()
  readonly deviceDetailsDto!: DeviceDetailsDto;

  @IsString()
  @IsNotEmpty()
  readonly first_name!: string;

  @IsString()
  @IsNotEmpty()
  readonly last_name!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(6)
  readonly otp?: string;
}
