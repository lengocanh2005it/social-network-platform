import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class SendSmsDto {
  @IsString()
  @IsNotEmpty()
  readonly from!: string;

  @IsPhoneNumber('VN')
  readonly to!: string;

  @IsString()
  @IsNotEmpty()
  readonly message!: string;
}
