import { ReportStatusEnum } from '@repo/db';
import { IsEnum } from 'class-validator';

export class UpdateReportStatusDto {
  @IsEnum(ReportStatusEnum)
  readonly status!: ReportStatusEnum;
}
