import { IsBoolean, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class UpdateUserSuspensionDto {
  @IsBoolean()
  is_suspended: boolean;

  @ValidateIf((o) => o.is_suspended === true)
  @IsString()
  @IsNotEmpty()
  readonly reason?: string;
}
