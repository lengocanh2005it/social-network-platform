import {
  CreateNotificationDto,
  DeleteNotificationQueryDto,
  GetNotificationQueryDto,
} from '@app/common/dtos/notifications';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { UsersType } from '@repo/db';
import { omit } from 'lodash';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientKafka,
    private readonly prismaService: PrismaService,
  ) {}

  onModuleInit() {
    const patterns = ['get-me', 'get-user-by-field'];

    patterns.forEach((p) => this.usersClient.subscribeToResponseOf(p));
  }

  public createNotification = async (
    createNotificationDto: CreateNotificationDto,
  ) => {
    await this.prismaService.notifications.create({
      data: createNotificationDto,
    });
  };

  public getNotifications = async (
    email: string,
    getNotificationQueryDto: GetNotificationQueryDto,
  ) => {
    const user = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
        }),
      ),
    );

    const { is_read } = getNotificationQueryDto;

    const limit = getNotificationQueryDto?.limit ?? 10;

    const decodedCursor = getNotificationQueryDto?.after
      ? this.decodeCursor(getNotificationQueryDto.after)
      : null;

    const notifications = await this.prismaService.notifications.findMany({
      where: {
        recipient_id: user.id,
        is_read,
      },
      take: limit + 1,
      orderBy: [
        {
          created_at: 'desc',
        },
      ],
      ...(decodedCursor && {
        cursor: {
          id: decodedCursor.notificationId,
          created_at: decodedCursor.createdAt,
        },
        skip: 1,
      }),
    });

    const hasNextPage = notifications.length > limit;

    const items = hasNextPage ? notifications.slice(0, -1) : notifications;

    const nextCursor = hasNextPage
      ? this.encodeCursor(
          items[items.length - 1].id,
          items[items.length - 1].created_at,
        )
      : null;

    return {
      data: await Promise.all(
        items.map((item) => this.getFormattedNotification(item.id)),
      ),
      nextCursor,
    };
  };

  public viewNotification = async (email: string, notificationId: string) => {
    const { user, notification } = await this.verifyUserNotification(
      email,
      notificationId,
    );

    if (user.id !== notification.recipient_id)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: `You are only allowed to view your own notifications.`,
      });

    await this.prismaService.notifications.update({
      where: {
        id: notificationId,
      },
      data: {
        is_read: true,
      },
    });

    return this.getFormattedNotification(notificationId);
  };

  public deleteNotifications = async (
    email: string,
    deleteNotificationQueryDto: DeleteNotificationQueryDto,
  ) => {
    const { notificationIds } = deleteNotificationQueryDto;

    await Promise.all(
      notificationIds.map(async (notificationId) => {
        const { user, notification } = await this.verifyUserNotification(
          email,
          notificationId,
        );

        if (user.id !== notification.recipient_id)
          throw new RpcException({
            statusCode: HttpStatus.FORBIDDEN,
            message: `You are only allowed to view your own notifications.`,
          });

        await this.prismaService.notifications.delete({
          where: {
            id: notificationId,
          },
        });
      }),
    );

    return {
      success: true,
      message:
        notificationIds.length > 1
          ? 'Selected notifications have been removed.'
          : 'The notification has been removed.',
    };
  };

  private verifyUserNotification = async (
    email: string,
    notificationId: string,
  ) => {
    const user = await firstValueFrom<UsersType>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
        }),
      ),
    );

    const notification = await this.prismaService.notifications.findUnique({
      where: {
        id: notificationId,
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
        recipient: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!notification)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The requested notification could not be found.`,
      });

    return {
      user,
      notification,
    };
  };

  private getFormattedNotification = async (notificationId: string) => {
    const notification = await this.prismaService.notifications.findUnique({
      where: {
        id: notificationId,
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
        recipient: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!notification)
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `The requested notification could not be found.`,
      });

    return {
      ...omit(notification, [
        'recipient',
        'recipient_id',
        'sender_id',
        'sender',
      ]),
      ...(notification?.sender && {
        sender: {
          id: notification.sender.id,
          full_name: `${notification.sender.profile?.first_name ?? ''} ${notification.sender.profile?.last_name ?? ''}`,
          avatar_url: notification.sender.profile?.avatar_url ?? '',
          username: notification.sender.profile?.username ?? '',
        },
      }),
    };
  };

  private encodeCursor = (notificationId: string, createdAt: Date): string => {
    const rawCursor = `${notificationId}::${createdAt.toISOString()}`;
    return Buffer.from(rawCursor).toString('base64');
  };

  private decodeCursor = (
    cursor: string,
  ): { notificationId: string; createdAt: Date } => {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8');
    const [notificationId, createdAtStr] = decoded.split('::');
    return {
      notificationId,
      createdAt: new Date(createdAtStr),
    };
  };
}
