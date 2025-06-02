import { GetPostQueryDto } from '@app/common/dtos/posts';
import {
  GetBlockedUsersListQueryDto,
  GetUserQueryDto,
  SearchUserQueryDto,
  UpdateUserProfileDto,
} from '@app/common/dtos/users';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

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

  async getMe(email: string, getUserQueryDto?: GetUserQueryDto): Promise<any> {
    return firstValueFrom(
      this.userClient.send('get-me', {
        email,
        getUserQueryDto,
      }),
    );
  }

  async updateUserProfile(
    updateUserProfileDto: UpdateUserProfileDto,
    email: string,
  ): Promise<any> {
    return firstValueFrom(
      this.userClient.send('update-profile', {
        updateUserProfileDto,
        email,
      }),
    );
  }

  async getFeed(
    getPostQueryDto: GetPostQueryDto,
    username: string,
    email: string,
  ) {
    return firstValueFrom(
      this.userClient.send('get-feed', {
        username,
        getPostQueryDto,
        email,
      }),
    );
  }

  public getProfile = async (
    username: string,
    email: string,
    getUserQueryDto?: GetUserQueryDto,
  ) => {
    return firstValueFrom(
      this.userClient.send('get-profile', {
        username,
        email,
        getUserQueryDto,
      }),
    );
  };

  public blockUser = async (targetUserId: string, email: string) => {
    return firstValueFrom(
      this.userClient.send('block-user', {
        targetUserId,
        email,
      }),
    );
  };

  public getBlockedUsersList = async (
    email: string,
    getBlockedUsersListQueryDto?: GetBlockedUsersListQueryDto,
  ) => {
    return firstValueFrom(
      this.userClient.send('get-blocked-users', {
        email,
        getBlockedUsersListQueryDto,
      }),
    );
  };

  public unblockUser = async (email: string, targetId: string) => {
    return firstValueFrom(
      this.userClient.send('unblock-user', {
        email,
        targetId,
      }),
    );
  };

  public getUsers = async (
    email: string,
    searchUserQueryDto: SearchUserQueryDto,
  ) => {
    return firstValueFrom(
      this.userClient.send('get-users', {
        email,
        searchUserQueryDto,
      }),
    );
  };
}
