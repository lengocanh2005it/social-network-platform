import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class GetFriendsListQueryDto {
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
  readonly username!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly full_name?: string;
}
