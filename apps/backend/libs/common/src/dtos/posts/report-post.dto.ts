import { ReportReasonEnum, ReportTypeEnum } from '@repo/db';
import { IsEnum } from 'class-validator';

export class ReportPostDto {
  @IsEnum(ReportTypeEnum)
  readonly type!: ReportTypeEnum;

  @IsEnum(ReportReasonEnum)
  readonly reason!: ReportReasonEnum;
}
