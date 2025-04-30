import { Gender } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateUserProfileDto {
  @IsPhoneNumber('VN')
  readonly phone_number!: string;

  @IsEnum(Gender)
  readonly gender!: Gender;

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
  readonly address!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly bio?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly nickname?: string;

  @IsString()
  @IsNotEmpty()
  readonly first_name!: string;

  @IsString()
  @IsNotEmpty()
  readonly last_name!: string;
}
