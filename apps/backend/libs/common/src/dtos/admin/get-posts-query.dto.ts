import { Type } from 'class-transformer';
import {
  IsOptional,
  IsEmail,
  IsInt,
  Min,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class GetPostsQueryDto {
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly limit?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly after?: string;
}
