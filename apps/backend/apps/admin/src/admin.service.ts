import {
  CreateActivityDto,
  GetActivitiesQueryDto,
  GetPostsQueryDto,
  GetSharePostsQueryDto,
  GetUsersQueryDto,
  UpdatePostStatusDto,
} from '@app/common/dtos/admin';
import { CreateNotificationDto } from '@app/common/dtos/notifications';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import {
  decodeCursor,
  encodeCursor,
  generateNotificationMessage,
  sendWithTimeout,
} from '@app/common/utils';
import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import {
  NotificationTypeEnum,
  RoleEnum,
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
  ) {}

  onModuleInit() {
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

    const activities = await this.prismaService.activities.findMany({
      where: {
        ...(name && name.length > 0
          ? {
              user: {
                profile: {
                  OR: [
                    { first_name: { contains: name, mode: 'insensitive' } },
                    { last_name: { contains: name, mode: 'insensitive' } },
                  ],
                },
              },
            }
          : {}),
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
}
