import {
  CreateFriendRequestDto,
  ResponseFriendRequestDto,
} from '@app/common/dtos/friends';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FriendsService implements OnModuleInit {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = [
      'create-friend-request',
      'delete-friend-request',
      'response-friend-request',
    ];

    patterns.forEach((pattern) =>
      this.usersClient.subscribeToResponseOf(pattern),
    );
  }

  public createFriendRequest = async (
    email: string,
    createFriendRequestDto: CreateFriendRequestDto,
  ) => {
    return firstValueFrom(
      this.usersClient.send('create-friend-request', {
        email,
        createFriendRequestDto,
      }),
    );
  };

  public responseFriendRequest = async (
    email: string,
    responseFriendRequestDto: ResponseFriendRequestDto,
  ) => {
    return firstValueFrom(
      this.usersClient.send('response-friend-request', {
        email,
        responseFriendRequestDto,
      }),
    );
  };

  public deleteFriendRequest = async (email: string, target_id: string) => {
    return firstValueFrom(
      this.usersClient.send('delete-friend-request', {
        email,
        target_id,
      }),
    );
  };
}
