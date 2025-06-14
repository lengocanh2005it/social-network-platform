import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class DeleteNotificationQueryDto {
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value
          .split(',')
          .map((v) => v.trim())
          .filter((v) => v !== '')
      : value,
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  readonly notificationIds!: string[];
}
