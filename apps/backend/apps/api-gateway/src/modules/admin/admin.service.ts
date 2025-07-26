import {
  GetActivitiesQueryDto,
  GetUsersQueryDto,
  UpdateUserSuspensionDto,
} from '@app/common/dtos/admin';
import { GetUserQueryDto } from '@app/common/dtos/users';
import { sendWithTimeout, toPlain } from '@app/common/utils';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientKafka,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = [
      'get-stats',
      'get-activities',
      'get-growth-overview',
      'get-users-dashboard',
      'update-user-suspension',
    ];
    patterns.forEach((p) => this.adminClient.subscribeToResponseOf(p));
    this.usersClient.subscribeToResponseOf('get-user-by-field');
  }

  public getStats = async () => {
    return sendWithTimeout(this.adminClient, 'get-stats', {});
  };

  public getActivities = async (
    getActivitiesQueryDto: GetActivitiesQueryDto,
  ) => {
    return sendWithTimeout(
      this.adminClient,
      'get-activities',
      toPlain(getActivitiesQueryDto),
    );
  };

  public getGrowthOverview = async () => {
    return sendWithTimeout(this.adminClient, 'get-growth-overview', {});
  };

  public getUsers = async (getUsersQueryDto: GetUsersQueryDto) => {
    return sendWithTimeout(
      this.adminClient,
      'get-users-dashboard',
      toPlain(getUsersQueryDto),
    );
  };

  public getUser = async (
    username: string,
    getUserQueryDto: GetUserQueryDto,
  ) => {
    return sendWithTimeout(
      this.usersClient,
      'get-user-by-field',
      JSON.stringify({
        field: 'username',
        value: username,
        getUserQueryDto,
      }),
    );
  };

  public updateUserSuspension = async (
    userId: string,
    email: string,
    updateUserSuspensionDto: UpdateUserSuspensionDto,
  ) => {
    return sendWithTimeout(this.adminClient, 'update-user-suspension', {
      userId,
      email,
      updateUserSuspensionDto,
    });
  };
}
