import { sendWithTimeout, StatsType } from '@app/common/utils';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientKafka,
    @Inject('POSTS_SERVICE') private readonly postsClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.usersClient.subscribeToResponseOf('get-users-stats');
    const postPatterns = [
      'get-active-reports',
      'get-posts-today',
      'get-new-comments',
      'get-active-reports',
    ];
    postPatterns.forEach((p) => this.postsClient.subscribeToResponseOf(p));
  }

  public getStats = async () => {
    const userStats = await sendWithTimeout<StatsType>(
      this.usersClient,
      'get-users-stats',
      {},
    );

    const postStats = await sendWithTimeout<StatsType>(
      this.postsClient,
      'get-posts-today',
      {},
    );

    const newComments = await sendWithTimeout<StatsType>(
      this.postsClient,
      'get-new-comments',
      {},
    );

    const activeReports = await sendWithTimeout<StatsType>(
      this.postsClient,
      'get-active-reports',
      {},
    );

    return {
      userStats,
      postStats,
      newComments,
      activeReports,
    };
  };
}
