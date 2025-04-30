import { AuthMethod } from '@app/common/utils';
import { IsEnum } from 'class-validator';
import { IsCodeFormat, IsURLFormat } from 'libs/common/decorators';

export class GetInfoOAuthCallbackDto {
  @IsURLFormat()
  readonly iss!: string;

  @IsCodeFormat()
  readonly code!: string;

  @IsEnum(AuthMethod)
  readonly authMethod!: AuthMethod;
}
