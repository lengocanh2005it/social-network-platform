import { Verify2FaActions } from '@app/common/utils';
import { IsEnum, IsString, Length } from 'class-validator';

export class Verify2FaDto {
  @IsString()
  @Length(6, 6)
  readonly otp!: string;

  @IsEnum(Verify2FaActions)
  readonly action!: Verify2FaActions;
}
