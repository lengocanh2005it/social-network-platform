import { IsBoolean, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class UpdatePostStatusDto {
  @IsBoolean()
  readonly is_active!: boolean;

  @ValidateIf((o) => o.is_active === false)
  @IsString()
  @IsNotEmpty()
  readonly reason?: string;
}
