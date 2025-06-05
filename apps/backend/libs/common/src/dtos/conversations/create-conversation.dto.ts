import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @IsUUID()
  @IsNotEmpty()
  readonly user_1_id!: string;

  @IsUUID()
  @IsNotEmpty()
  readonly user_2_id!: string;
}
