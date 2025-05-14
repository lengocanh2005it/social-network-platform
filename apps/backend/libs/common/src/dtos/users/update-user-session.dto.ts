import { SessionStatusEnum, SessionStatusType } from '@repo/db';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateUserSessionDto {
  @IsUUID()
  readonly user_id!: string;

  @IsString()
  @IsNotEmpty()
  readonly finger_print!: string;

  @IsEnum(SessionStatusEnum)
  readonly status!: SessionStatusType;
}
