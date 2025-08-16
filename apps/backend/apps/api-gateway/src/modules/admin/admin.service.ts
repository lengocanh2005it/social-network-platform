import {
  GetActivitiesQueryDto,
  GetPostsQueryDto,
  GetReportersOfReportQueryDto,
  GetReportsQueryDto,
  GetSharePostsQueryDto,
  GetStoriesQueryDto,
  GetUsersQueryDto,
  UpdatePostStatusDto,
  UpdateReportStatusDto,
  UpdateStoryStatusDto,
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
      'get-posts-dashboard',
      'update-post-status',
      'get-shares-of-post',
      'get-stories-dashboard',
      'update-story-status',
      'get-reports',
      'get-reporters-of-report',
      'update-report-status',
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

  public getPosts = async (
    getPostsQueryDto: GetPostsQueryDto,
    email: string,
  ) => {
    return sendWithTimeout(this.adminClient, 'get-posts-dashboard', {
      getPostsQueryDto: toPlain(getPostsQueryDto),
      email,
    });
  };

  public updatePostStatus = async (
    postId: string,
    updatePostStatusDto: UpdatePostStatusDto,
    email: string,
  ) => {
    return sendWithTimeout(this.adminClient, 'update-post-status', {
      postId,
      updatePostStatusDto: toPlain(updatePostStatusDto),
      email,
    });
  };

  public getSharesOfPost = async (
    postId: string,
    getSharePostsQueryDto: GetSharePostsQueryDto,
    email: string,
  ) => {
    return sendWithTimeout(this.adminClient, 'get-shares-of-post', {
      postId,
      getSharePostsQueryDto: toPlain(getSharePostsQueryDto),
      email,
    });
  };

  public getStories = async (
    getStoriesQueryDto: GetStoriesQueryDto,
    email: string,
  ) => {
    return sendWithTimeout(this.adminClient, 'get-stories-dashboard', {
      getStoriesQueryDto: toPlain(getStoriesQueryDto),
      email,
    });
  };

  public updateStoryStatus = async (
    storyId: string,
    updateStoryStatusDto: UpdateStoryStatusDto,
    email: string,
  ) => {
    return sendWithTimeout(this.adminClient, 'update-story-status', {
      storyId,
      updateStoryStatusDto: toPlain(updateStoryStatusDto),
      email,
    });
  };

  public getReports = async (
    getReportsQueryDto: GetReportsQueryDto,
    email: string,
  ) => {
    return sendWithTimeout(this.adminClient, 'get-reports', {
      getReportsQueryDto: toPlain(getReportsQueryDto),
      email,
    });
  };

  public getReportersOfReport = async (
    getReportersOfReportQueryDto: GetReportersOfReportQueryDto,
    targetId: string,
  ) => {
    return sendWithTimeout(this.adminClient, 'get-reporters-of-report', {
      getReportersOfReportQueryDto: toPlain(getReportersOfReportQueryDto),
      targetId,
    });
  };

  public updateReportStatus = async (
    updateReportStatusDto: UpdateReportStatusDto,
    reportId: string,
  ) => {
    return sendWithTimeout(this.adminClient, 'update-report-status', {
      updateReportStatusDto: toPlain(updateReportStatusDto),
      reportId,
    });
  };
}
