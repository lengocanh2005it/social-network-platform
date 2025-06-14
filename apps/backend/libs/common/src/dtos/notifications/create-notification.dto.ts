import { NotificationType, NotificationTypeEnum } from '@repo/db';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateNotificationDto {
  @IsEnum(NotificationTypeEnum)
  readonly type!: NotificationType;

  @IsString()
  @IsNotEmpty()
  readonly content!: string;

  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, any>;

  @IsUUID()
  readonly recipient_id!: string;

  @IsOptional()
  @IsUUID()
  readonly sender_id?: string;
}
