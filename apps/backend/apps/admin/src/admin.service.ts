import {
  CreateActivityDto,
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
} from '@app/common/dtos/admin';
import { CreateNotificationDto } from '@app/common/dtos/notifications';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import {
  decodeCursor,
  encodeCursor,
  generateNotificationMessage,
  GroupedReport,
  sendWithTimeout,
} from '@app/common/utils';
import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import {
  NotificationTypeEnum,
  PostsType,
  ReportTypeEnum,
  RoleEnum,
  StoryStatusEnum,
  UserSesstionsType,
  UsersType,
} from '@repo/db';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { omit } from 'lodash';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientKafka,
    @Inject('POSTS_SERVICE') private readonly postsClient: ClientKafka,
    private readonly prismaService: PrismaService,
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientKafka,
    @Inject('STORIES_SERVICE') private readonly storiesClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.storiesClient.subscribeToResponseOf('get-formatted-story');
    this.usersClient.subscribeToResponseOf('get-users-stats');
    this.usersClient.subscribeToResponseOf('get-user-by-field');
    const postPatterns = [
      'get-active-reports',
      'get-posts-today',
      'get-new-comments',
      'get-active-reports',
      'get-formatted-post',
    ];
    postPatterns.forEach((p) => this.postsClient.subscribeToResponseOf(p));
  }

  public getStats = async () => {
    const userStats = await sendWithTimeout(
      this.usersClient,
      'get-users-stats',
      {},
    );

    const postStats = await sendWithTimeout(
      this.postsClient,
      'get-posts-today',
      {},
    );

    const newComments = await sendWithTimeout(
      this.postsClient,
      'get-new-comments',
      {},
    );

    const activeReports = await sendWithTimeout(
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

  public getActivities = async (
    getActivitiesQueryDto: GetActivitiesQueryDto,
  ) => {
    const limit = getActivitiesQueryDto?.limit ?? 10;

    const decodedCursor = getActivitiesQueryDto?.after
      ? decodeCursor(getActivitiesQueryDto.after)
      : null;

    const name = getActivitiesQueryDto?.fullName?.trim();
    let profileWhereClause: any = {};

    if (name) {
      const nameParts = name.split(' ').filter(Boolean);

      if (nameParts.length === 1) {
        const single = nameParts[0];
        profileWhereClause = {
          OR: [
            { first_name: { contains: single, mode: 'insensitive' } },
            { last_name: { contains: single, mode: 'insensitive' } },
          ],
        };
      } else if (nameParts.length >= 2) {
        const [first, ...rest] = nameParts;
        const last = rest.join(' ');
        profileWhereClause = {
          AND: [
            { first_name: { contains: first, mode: 'insensitive' } },
            { last_name: { contains: last, mode: 'insensitive' } },
          ],
        };
      }
    }

    const activities = await this.prismaService.activities.findMany({
      where: {
        ...(profileWhereClause && {
          user: {
            profile: profileWhereClause,
          },
        }),
      },
      take: limit + 1,
      orderBy: {
        created_at: 'desc',
      },
      ...(decodedCursor && {
        cursor: {
          id: decodedCursor.id,
          created_at: decodedCursor.created_at,
        },
        skip: 1,
      }),
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    const hasNextPage = activities.length > limit;

    const items = hasNextPage ? activities.slice(0, -1) : activities;

    return {
      data: items.map((i) => omit(i as any, ['user.password'])),
      nextCursor: hasNextPage
        ? encodeCursor({
            id: items[items.length - 1].id,
            created_at: items[items.length - 1].created_at,
          })
        : null,
    };
  };

  public createActivity = async (
    createActivityDto: CreateActivityDto,
    userId: string,
  ) => {
    const user = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'id',
          value: userId,
        }),
      ),
    );

    await this.prismaService.activities.create({
      data: {
        ...createActivityDto,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  };

  public getGrowthOverview = async () => {
    const months = Array.from({ length: 7 }, (_, i) => {
      const date = subMonths(new Date(), 6 - i);
      return {
        label: format(date, 'MMM - yyyy'),
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    });

    const data = await Promise.all(
      months.map(async ({ label, start, end }) => {
        const [userCount, postCount] = await Promise.all([
          this.prismaService.users.count({
            where: {
              role: RoleEnum.user,
              profile: {
                created_at: {
                  gte: start,
                  lte: end,
                },
              },
            },
          }),
          this.prismaService.posts.count({
            where: {
              created_at: {
                gte: start,
                lte: end,
              },
            },
          }),
        ]);

        return {
          name: label,
          users: userCount,
          posts: postCount,
        };
      }),
    );

    return data;
  };

  public getUsers = async (getUsersQueryDto: GetUsersQueryDto) => {
    const limit = getUsersQueryDto?.limit ?? 10;

    const decodedCursor = getUsersQueryDto?.after
      ? decodeCursor(getUsersQueryDto.after)
      : null;

    const name = getUsersQueryDto?.fullName?.trim();

    const profileWhereClause: any = {};

    if (getUsersQueryDto?.username) {
      profileWhereClause.username = { equals: getUsersQueryDto.username };
    }

    if (getUsersQueryDto?.phoneNumber) {
      profileWhereClause.phone_number = {
        equals: getUsersQueryDto?.phoneNumber,
      };
    }

    if (name) {
      const nameParts = name.split(' ').filter(Boolean);

      const matchMode =
        getUsersQueryDto?.exactMatch?.trim() === 'true' ? 'equals' : 'contains';

      if (nameParts.length === 1) {
        const single = nameParts[0];
        profileWhereClause.OR = [
          { first_name: { [matchMode]: single, mode: 'insensitive' } },
          { last_name: { [matchMode]: single, mode: 'insensitive' } },
        ];
      } else if (nameParts.length >= 2) {
        const [first, ...rest] = nameParts;
        const last = rest.join(' ');

        profileWhereClause.AND = [
          { first_name: { [matchMode]: first, mode: 'insensitive' } },
          { last_name: { [matchMode]: last, mode: 'insensitive' } },
        ];
      }
    }

    const userWhereClause: any = {};

    if (getUsersQueryDto?.email) {
      userWhereClause.email = { equals: getUsersQueryDto.email };
    }

    if (Object.keys(profileWhereClause).length > 0) {
      userWhereClause.profile = {
        is: profileWhereClause,
      };
    }

    const users = await this.prismaService.users.findMany({
      where: {
        ...userWhereClause,
        role: RoleEnum.user,
      },
      take: limit + 1,
      skip: decodedCursor ? 1 : 0,
      ...(decodedCursor && {
        cursor: {
          id: decodedCursor.id,
        },
      }),
      orderBy: [
        {
          id: 'desc',
        },
      ],
      include: {
        profile: true,
        sessions: true,
      },
    });

    const hasNextPage = users.length > limit;
    const items = hasNextPage ? users.slice(0, -1) : users;

    return {
      data: items.map((i: any) => {
        const is_online = i.sessions?.some(
          (s: UserSesstionsType) => s.is_online === true,
        );

        const last_seen_at = i.sessions?.length
          ? (i.sessions
              .map((s: UserSesstionsType) => s.last_seen_at)
              .filter(Boolean)
              .sort(
                (a: Date | string, b: Date | string) =>
                  new Date(b).getTime() - new Date(a).getTime(),
              )[0] ?? null)
          : null;

        return {
          ...omit(i, ['password', 'sessions']),
          is_online,
          last_seen_at,
        };
      }),
      nextCursor: hasNextPage
        ? encodeCursor({
            id: items[items.length - 1].id,
          })
        : null,
    };
  };

  public getPosts = async (
    getPostsQueryDto: GetPostsQueryDto,
    email: string,
  ) => {
    const admin = await sendWithTimeout<UsersType>(
      this.usersClient,
      'get-user-by-field',
      JSON.stringify({
        field: 'email',
        value: email,
      }),
    );

    const limit = getPostsQueryDto?.limit ?? 10;

    const decodedCursor = getPostsQueryDto?.after
      ? decodeCursor(getPostsQueryDto.after)
      : null;

    const posts = await this.prismaService.posts.findMany({
      where: getPostsQueryDto?.email?.trim()
        ? {
            user: {
              is: {
                email: getPostsQueryDto.email,
              },
            },
          }
        : {},
      take: limit + 1,
      skip: decodedCursor ? 1 : 0,
      ...(decodedCursor && {
        cursor: {
          id: decodedCursor.id,
          created_at: decodedCursor.created_at,
        },
      }),
      orderBy: [{ created_at: 'desc' }],
      include: {
        user: true,
        contents: true,
        images: true,
        videos: true,
        hashtags: true,
        parent: {
          include: {
            user: true,
            contents: true,
            images: true,
            hashtags: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            shares: true,
          },
        },
      },
    });

    const hasNextPage = posts.length > limit;
    const items = hasNextPage ? posts.slice(0, -1) : posts;

    return {
      data: await Promise.all(
        items.map((item) =>
          sendWithTimeout(
            this.postsClient,
            'get-formatted-post',
            JSON.stringify({
              postId: item.id,
              userId: admin.id,
              parentPostId: item?.parent_post_id,
              withDeleted: true,
            }),
          ),
        ),
      ),
      nextCursor: hasNextPage
        ? encodeCursor({
            id: items[items.length - 1].id,
            created_at: items[items.length - 1].created_at,
          })
        : null,
    };
  };

  public updatePostStatus = async (
    postId: string,
    updatePostStatusDto: UpdatePostStatusDto,
    email: string,
  ) => {
    const admin = await sendWithTimeout<UsersType>(
      this.usersClient,
      'get-user-by-field',
      JSON.stringify({
        field: 'email',
        value: email,
      }),
    );

    const post = await this.prismaService.posts.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Post not found.',
      });

    const { is_active, reason } = updatePostStatusDto;

    if (post.deleted_at && is_active === false)
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message:
          'Cannot deactivate a post that has already been deleted by the system.',
      });

    if (!post.deleted_at && is_active === true)
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: 'Post is already active and cannot be activated again.',
      });

    await this.prismaService.posts.update({
      where: {
        id: postId,
      },
      data: {
        deleted_at: is_active === true ? null : new Date(),
      },
    });

    const createNotificationDto: CreateNotificationDto = {
      type:
        is_active === true
          ? NotificationTypeEnum.post_restored_by_admin
          : NotificationTypeEnum.post_removed_by_admin,
      content: generateNotificationMessage(
        is_active === true
          ? NotificationTypeEnum.post_restored_by_admin
          : NotificationTypeEnum.post_removed_by_admin,
        {
          ...(is_active === false && {
            reason,
          }),
        },
      ),
      recipient_id: post.user_id,
      sender_id: admin.id,
      metadata: {
        post_id: post.id,
      },
    };

    this.notificationsClient.emit('create-notification', createNotificationDto);

    return {
      success: true,
      message:
        is_active === true
          ? 'Post has been restored successfully.'
          : 'Post has been deactivated successfully.',
    };
  };

  public getSharesOfPost = async (
    postId: string,
    getSharePostsQueryDto: GetSharePostsQueryDto,
    email: string,
  ) => {
    const admin = await sendWithTimeout<UsersType>(
      this.usersClient,
      'get-user-by-field',
      JSON.stringify({
        field: 'email',
        value: email,
      }),
    );

    const post = await this.prismaService.posts.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Post not found.`,
      });

    const limit = getSharePostsQueryDto?.limit ?? 10;

    const decodedCursor = getSharePostsQueryDto?.after
      ? decodeCursor(getSharePostsQueryDto.after)
      : null;

    const shares = await this.prismaService.posts.findMany({
      where: {
        parent_post_id: post.id,
      },
      take: limit + 1,
      skip: decodedCursor ? 1 : 0,
      ...(decodedCursor && {
        cursor: {
          id: decodedCursor.id,
          created_at: decodedCursor.created_at,
        },
      }),
      orderBy: [{ created_at: 'desc' }],
      include: {
        user: true,
        contents: true,
        images: true,
        videos: true,
        hashtags: true,
        parent: {
          include: {
            user: true,
            contents: true,
            images: true,
            hashtags: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            shares: true,
          },
        },
      },
    });

    const hasNextPage = shares.length > limit;
    const items = hasNextPage ? shares.slice(0, -1) : shares;

    return {
      data: await Promise.all(
        items.map((item) =>
          sendWithTimeout(
            this.postsClient,
            'get-formatted-post',
            JSON.stringify({
              postId: item.id,
              userId: admin.id,
              parentPostId: item?.parent_post_id,
              withDeleted: true,
            }),
          ),
        ),
      ),
      nextCursor: hasNextPage
        ? encodeCursor({
            id: items[items.length - 1].id,
            created_at: items[items.length - 1].created_at,
          })
        : null,
    };
  };

  public getStories = async (
    getStoriesQueryDto: GetStoriesQueryDto,
    email: string,
  ) => {
    const admin = await sendWithTimeout<UsersType>(
      this.usersClient,
      'get-user-by-field',
      JSON.stringify({
        field: 'email',
        value: email,
      }),
    );

    const limit = getStoriesQueryDto?.limit ?? 10;

    const decodedCursor = getStoriesQueryDto?.after
      ? decodeCursor(getStoriesQueryDto.after)
      : null;

    const {
      email: emailSearch,
      username,
      from,
      to,
      status,
    } = getStoriesQueryDto;

    const whereClause = {
      ...(emailSearch || username
        ? {
            user: {
              ...(emailSearch ? { email: emailSearch } : {}),
              ...(username
                ? {
                    profile: {
                      is: {
                        username,
                      },
                    },
                  }
                : {}),
            },
          }
        : {}),
      ...(status ? { status } : {}),
      ...(from || to
        ? {
            created_at: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const stories = await this.prismaService.stories.findMany({
      where: whereClause,
      take: limit + 1,
      skip: decodedCursor ? 1 : 0,
      ...(decodedCursor && {
        cursor: {
          id: decodedCursor.id,
          created_at: decodedCursor.created_at,
        },
      }),
      orderBy: [{ created_at: 'desc' }],
    });

    const hasNextPage = stories.length > limit;
    const items = hasNextPage ? stories.slice(0, -1) : stories;

    return {
      data: await Promise.all(
        items.map((item) =>
          sendWithTimeout(
            this.storiesClient,
            'get-formatted-story',
            JSON.stringify({
              storyId: item.id,
              currentUserId: admin.id,
            }),
          ),
        ),
      ),
      nextCursor: hasNextPage
        ? encodeCursor({
            id: items[items.length - 1].id,
            created_at: items[items.length - 1].created_at,
          })
        : null,
    };
  };

  public updateStoryStatus = async (
    storyId: string,
    updateStoryStatusDto: UpdateStoryStatusDto,
    email: string,
  ) => {
    const admin = await sendWithTimeout<UsersType>(
      this.usersClient,
      'get-user-by-field',
      JSON.stringify({
        field: 'email',
        value: email,
      }),
    );

    const story = await this.prismaService.stories.findUnique({
      where: {
        id: storyId,
      },
    });

    if (!story)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Story not found.`,
      });

    const { status, reason } = updateStoryStatusDto;

    if (status === StoryStatusEnum.inactive && !reason)
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'A reason must be provided when deactivating a story.',
      });

    if (status === StoryStatusEnum.expired) {
      await this.prismaService.stories.delete({
        where: {
          id: storyId,
        },
      });
    } else {
      await this.prismaService.stories.update({
        where: {
          id: storyId,
        },
        data: {
          status,
        },
      });
    }

    const typeNotification =
      status === StoryStatusEnum.active
        ? NotificationTypeEnum.story_unlocked_by_admin
        : status === StoryStatusEnum.inactive
          ? NotificationTypeEnum.story_locked_by_admin
          : NotificationTypeEnum.story_expired_notification;

    const createNotificationDto: CreateNotificationDto = {
      type: typeNotification,
      content: generateNotificationMessage(typeNotification, {
        ...(status === StoryStatusEnum.inactive && {
          reason,
        }),
      }),
      recipient_id: story.user_id,
      sender_id: admin.id,
      metadata: {
        story_id: story.id,
      },
    };

    this.notificationsClient.emit('create-notification', createNotificationDto);

    return {
      success: true,
      message: 'Story status updated successfully.',
    };
  };

  public getReports = async (
    getReportsQueryDto: GetReportsQueryDto,
    email: string,
  ) => {
    const admin = await sendWithTimeout<UsersType>(
      this.usersClient,
      'get-user-by-field',
      JSON.stringify({
        field: 'email',
        value: email,
      }),
    );

    const limit = getReportsQueryDto?.limit ?? 10;
    const { from, to, type, after } = getReportsQueryDto;
    const decodedCursor = after
      ? (JSON.parse(Buffer.from(after, 'base64').toString()) as {
          targetId: string;
          count: number;
        })
      : null;

    const whereClause = {
      ...(from || to
        ? {
            created_at: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
      ...(type && { type }),
    };

    const grouped = await this.prismaService.reports.groupBy({
      by: ['target_id', 'type'],
      _count: { id: true },
      where: whereClause,
      orderBy: [{ _count: { id: 'desc' } }, { target_id: 'asc' }],
      ...(decodedCursor && {
        having: {
          OR: [
            {
              id: {
                _count: { lt: decodedCursor.count },
              },
            },
            {
              AND: [
                {
                  id: {
                    _count: { equals: decodedCursor.count },
                  },
                },
                {
                  target_id: { gt: decodedCursor.targetId },
                },
              ],
            },
          ],
        },
      }),
      take: limit + 1,
    });

    const hasNextPage = grouped.length > limit;
    const groupsToFetch = hasNextPage ? grouped.slice(0, -1) : grouped;

    const result = await Promise.all(
      groupsToFetch.map(async (g) => {
        const reports = await this.prismaService.reports.findMany({
          where: {
            target_id: g.target_id,
            type: g.type,
          },
          orderBy: { created_at: 'desc' },
          include: {
            reporter: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    first_name: true,
                    last_name: true,
                    avatar_url: true,
                    username: true,
                  },
                },
              },
            },
          },
          take: 5,
        });

        let postDetails: any = null;
        let storyDetails: any = null;

        if (g.type === ReportTypeEnum.post) {
          const tempPostDetails = await sendWithTimeout<PostsType>(
            this.postsClient,
            'get-formatted-post',
            JSON.stringify({
              postId: g.target_id,
              userId: admin.id,
              withDeleted: true,
            }),
          );

          if (tempPostDetails) {
            postDetails = await sendWithTimeout<PostsType>(
              this.postsClient,
              'get-formatted-post',
              JSON.stringify({
                postId: tempPostDetails.id,
                userId: admin.id,
                withDeleted: true,
                parentPostId: tempPostDetails?.parent_post_id,
              }),
            );
          }
        } else if (g.type === ReportTypeEnum.story) {
          storyDetails = await sendWithTimeout<any>(
            this.storiesClient,
            'get-formatted-story',
            JSON.stringify({
              storyId: g.target_id,
              currentUserId: admin.id,
            }),
          );
        }

        return {
          targetId: g.target_id,
          type: g.type,
          count: g._count.id,
          reports,
          ...(g.type === ReportTypeEnum.post &&
            postDetails && {
              post: postDetails,
            }),
          ...(g.type === ReportTypeEnum.story &&
            storyDetails && {
              story: storyDetails,
            }),
        };
      }),
    );

    return {
      data: result,
      nextCursor: hasNextPage
        ? Buffer.from(
            JSON.stringify({
              targetId: groupsToFetch[groupsToFetch.length - 1].target_id,
              count: groupsToFetch[groupsToFetch.length - 1]?._count?.id ?? 0,
            }),
          ).toString('base64')
        : null,
    };
  };

  public getReportersOfReport = async (
    getReportersOfReportQueryDto: GetReportersOfReportQueryDto,
    targetId: string,
  ) => {
    const limit = getReportersOfReportQueryDto?.limit ?? 10;

    const decodedCursor = getReportersOfReportQueryDto?.after
      ? decodeCursor(getReportersOfReportQueryDto.after)
      : null;

    const whereClause = {
      target_id: targetId,
      ...(getReportersOfReportQueryDto?.reason && {
        reason: getReportersOfReportQueryDto.reason,
      }),
    };

    const reports = await this.prismaService.reports.findMany({
      where: whereClause,
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                first_name: true,
                last_name: true,
                username: true,
                avatar_url: true,
              },
            },
          },
        },
      },
      take: limit + 1,
      orderBy: {
        created_at: 'desc',
      },
      ...(decodedCursor && {
        cursor: {
          id: decodedCursor.id,
          created_at: decodedCursor.created_at,
        },
        skip: 1,
      }),
    });

    const hasNextPage = reports.length > limit;
    const items = hasNextPage ? reports.slice(0, -1) : reports;

    return {
      data: items,
      nextCursor: hasNextPage
        ? encodeCursor({
            id: items[items.length - 1].id,
            created_at: items[items.length - 1].created_at,
          })
        : null,
    };
  };

  public updateReportStatus = async (
    updateReportStatusDto: UpdateReportStatusDto,
    reportId: string,
  ) => {
    const report = await this.prismaService.reports.findUnique({
      where: {
        id: reportId,
      },
    });

    if (!report)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Report not found.`,
      });

    await this.prismaService.reports.update({
      where: {
        id: reportId,
      },
      data: {
        status: updateReportStatusDto.status,
      },
    });

    return {
      success: true,
      message: `Report status updated successfully.`,
    };
  };
}
