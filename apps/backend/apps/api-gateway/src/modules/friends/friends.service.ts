import {
  CreateFriendRequestDto,
  GetFriendRequestsQueryDto,
  GetFriendsListQueryDto,
  ResponseFriendRequestDto,
} from '@app/common/dtos/friends';
import { sendWithTimeout, toPlain } from '@app/common/utils';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

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
      'get-friend-requests',
      'get-friends-list',
    ];

    patterns.forEach((pattern) =>
      this.usersClient.subscribeToResponseOf(pattern),
    );
  }

  public createFriendRequest = async (
    email: string,
    createFriendRequestDto: CreateFriendRequestDto,
  ) => {
    return sendWithTimeout(this.usersClient, 'create-friend-request', {
      email,
      createFriendRequestDto: toPlain(createFriendRequestDto),
    });
  };

  public responseFriendRequest = async (
    email: string,
    responseFriendRequestDto: ResponseFriendRequestDto,
  ) => {
    return sendWithTimeout(this.usersClient, 'response-friend-request', {
      email,
      responseFriendRequestDto: toPlain(responseFriendRequestDto),
    });
  };

  public deleteFriendRequest = async (email: string, target_id: string) => {
    return sendWithTimeout(this.usersClient, 'delete-friend-request', {
      email,
      target_id,
    });
  };

  public getFriendRequests = async (
    email: string,
    getFriendRequestsQueryDto?: GetFriendRequestsQueryDto,
  ) => {
    return sendWithTimeout(this.usersClient, 'get-friend-requests', {
      email,
      getFriendRequestsQueryDto: toPlain(getFriendRequestsQueryDto),
    });
  };

  public getFriendsList = async (
    email: string,
    getFriendsListQueryDto: GetFriendsListQueryDto,
  ) => {
    return sendWithTimeout(this.usersClient, 'get-friends-list', {
      email,
      getFriendsListQueryDto: toPlain(getFriendsListQueryDto),
    });
  };
}
