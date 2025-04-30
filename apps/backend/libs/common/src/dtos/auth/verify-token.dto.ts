import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyTokenDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly token?: string;
}
