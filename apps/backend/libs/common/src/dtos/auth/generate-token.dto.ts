import { IsUUID } from 'class-validator';

export class GenerateTokenDto {
  @IsUUID('4')
  readonly payload!: string;
}
