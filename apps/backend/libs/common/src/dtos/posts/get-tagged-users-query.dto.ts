import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsNotEmpty } from 'class-validator';

export class GetTaggedUsersQueryDto {
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
