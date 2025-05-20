import { Verify2FaActions } from '@app/common/utils';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class Verify2FaDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  @Length(6, 6)
  readonly otp!: string;

  @IsEnum(Verify2FaActions)
  readonly action!: Verify2FaActions;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly token?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly password?: string;
}
