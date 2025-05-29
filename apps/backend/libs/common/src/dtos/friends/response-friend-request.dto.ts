import { ResponseFriendRequestAction } from '@app/common/utils';
import { IsEnum, IsUUID } from 'class-validator';

export class ResponseFriendRequestDto {
  @IsEnum(ResponseFriendRequestAction)
  readonly action!: ResponseFriendRequestAction;

  @IsUUID()
  readonly initiator_id!: string;
}
