import {
  GetActivitiesQueryDto,
  GetUsersQueryDto,
} from '@app/common/dtos/admin';
import { sendWithTimeout, toPlain } from '@app/common/utils';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = [
      'get-stats',
      'get-activities',
      'get-growth-overview',
      'get-users',
    ];
    patterns.forEach((p) => this.adminClient.subscribeToResponseOf(p));
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
      'get-users',
      toPlain(getUsersQueryDto),
    );
  };
}
