import { SessionStatusEnum, SessionStatusType } from '@repo/db';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateUserSessionDto {
  @IsUUID()
  readonly user_id!: string;

  @IsString()
  @IsNotEmpty()
  readonly finger_print!: string;

  @IsEnum(SessionStatusEnum)
  readonly status!: SessionStatusType;

  @IsBoolean()
  readonly is_online!: boolean;

  @IsDate()
  readonly last_seen_at!: Date;
}
