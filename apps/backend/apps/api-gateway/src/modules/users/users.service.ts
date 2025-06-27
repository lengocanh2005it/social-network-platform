import { GetPostQueryDto } from '@app/common/dtos/posts';
import {
  GetBlockedUsersListQueryDto,
  GetUserQueryDto,
  SearchUserQueryDto,
  UpdateUserProfileDto,
} from '@app/common/dtos/users';
import { sendWithTimeout, toPlain } from '@app/common/utils';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @Inject('USERS_SERVICE') private readonly userClient: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = [
      'get-me',
      'update-profile',
      'verify-password',
      'get-user-device',
      'get-user-session',
      'get-feed',
      'get-profile',
      'block-user',
      'get-blocked-users',
      'unblock-user',
      'get-users',
    ];

    patterns.forEach((pattern) => {
      this.userClient.subscribeToResponseOf(pattern);
    });
  }

  async getMe(email: string, getUserQueryDto: GetUserQueryDto): Promise<any> {
    return sendWithTimeout(this.userClient, 'get-me', {
      email,
      getUserQueryDto: toPlain(getUserQueryDto),
    });
  }

  async updateUserProfile(
    updateUserProfileDto: UpdateUserProfileDto,
    email: string,
  ): Promise<any> {
    return sendWithTimeout(this.userClient, 'update-profile', {
      updateUserProfileDto: toPlain(updateUserProfileDto),
      email,
    });
  }

  async getFeed(
    getPostQueryDto: GetPostQueryDto,
    username: string,
    email: string,
  ) {
    return sendWithTimeout(this.userClient, 'get-feed', {
      username,
      getPostQueryDto: toPlain(getPostQueryDto),
      email,
    });
  }

  public getProfile = async (
    username: string,
    email: string,
    getUserQueryDto: GetUserQueryDto,
  ) => {
    return sendWithTimeout(this.userClient, 'get-profile', {
      username,
      email,
      getUserQueryDto: toPlain(getUserQueryDto),
    });
  };

  public blockUser = async (targetUserId: string, email: string) => {
    return sendWithTimeout(this.userClient, 'block-user', {
      targetUserId,
      email,
    });
  };

  public getBlockedUsersList = async (
    email: string,
    getBlockedUsersListQueryDto?: GetBlockedUsersListQueryDto,
  ) => {
    return sendWithTimeout(this.userClient, 'get-blocked-users', {
      email,
      getBlockedUsersListQueryDto: toPlain(getBlockedUsersListQueryDto),
    });
  };

  public unblockUser = async (email: string, targetId: string) => {
    return sendWithTimeout(this.userClient, 'unblock-user', {
      email,
      targetId,
    });
  };

  public getUsers = async (
    email: string,
    searchUserQueryDto: SearchUserQueryDto,
  ) => {
    return sendWithTimeout(this.userClient, 'get-users', {
      email,
      searchUserQueryDto: toPlain(searchUserQueryDto),
    });
  };
}
