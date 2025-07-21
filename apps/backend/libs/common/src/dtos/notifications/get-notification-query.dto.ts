import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class GetNotificationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly limit?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly after?: string;

  @IsString()
  @IsNotEmpty()
  readonly is_read!: string;
}
