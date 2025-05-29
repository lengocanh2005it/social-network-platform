import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateFriendRequestDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  readonly target_id!: string;
}
