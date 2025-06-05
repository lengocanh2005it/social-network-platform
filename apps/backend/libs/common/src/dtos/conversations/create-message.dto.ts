import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  readonly content!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly reply_to_message_id?: string;

  @IsUUID()
  @IsString()
  @IsNotEmpty()
  readonly target_id!: string;
}
