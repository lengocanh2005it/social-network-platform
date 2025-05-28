import { DeviceDetailsDto } from '@app/common/dtos/auth';
import { IsEmail } from 'class-validator';

export class TrustDeviceDto extends DeviceDetailsDto {
  @IsEmail()
  readonly email!: string;
}
