import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateUserSessionDto {
  @IsString()
  @IsNotEmpty()
  readonly refresh_token: string;

  @IsString()
  @IsNotEmpty()
  readonly finger_print!: string;

  @IsString()
  @IsNotEmpty()
  readonly device_name!: string;

  @IsString()
  @IsNotEmpty()
  readonly user_agent!: string;

  @IsString()
  @IsNotEmpty()
  readonly ip_address!: string;

  @IsUUID('4')
  readonly user_id!: string;

  @IsDate()
  readonly expires_at!: Date;
}
