import {
  CreateActivityDto,
  GetActivitiesQueryDto,
} from '@app/common/dtos/admin';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import { decodeCursor, encodeCursor, sendWithTimeout } from '@app/common/utils';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { RoleEnum, UsersType } from '@repo/db';
import { omit } from 'lodash';
import { firstValueFrom } from 'rxjs';
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientKafka,
    @Inject('POSTS_SERVICE') private readonly postsClient: ClientKafka,
    private readonly prismaService: PrismaService,
  ) {}

  onModuleInit() {
    this.usersClient.subscribeToResponseOf('get-users-stats');
    this.usersClient.subscribeToResponseOf('get-user-by-field');
    const postPatterns = [
      'get-active-reports',
      'get-posts-today',
      'get-new-comments',
      'get-active-reports',
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
}
