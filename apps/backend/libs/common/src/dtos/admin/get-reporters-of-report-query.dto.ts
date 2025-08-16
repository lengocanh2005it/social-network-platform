import { ReportReasonEnum } from '@repo/db';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';

export class GetReportersOfReportQueryDto {
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
  @IsEnum(ReportReasonEnum)
  readonly reason?: ReportReasonEnum;
}
