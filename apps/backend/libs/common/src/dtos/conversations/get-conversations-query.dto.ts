import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class GetConversationsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly limit?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly after?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly full_name?: string;
}
