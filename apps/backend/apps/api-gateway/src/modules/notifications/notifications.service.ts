import {
  DeleteNotificationQueryDto,
  GetNotificationQueryDto,
} from '@app/common/dtos/notifications';
import { sendWithTimeout, toPlain } from '@app/common/utils';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(
    @Inject('NOTIFICATIONS_SERVICE')
    private readonly notificationsClient: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = [
      'get-notifications',
      'view-notification',
      'delete-notifications',
    ];

    patterns.forEach((p) => this.notificationsClient.subscribeToResponseOf(p));
  }

  public getNotifications = async (
    email: string,
    getNotificationQueryDto: GetNotificationQueryDto,
  ) => {
    return sendWithTimeout(this.notificationsClient, 'get-notifications', {
      email,
      getNotificationQueryDto: toPlain(getNotificationQueryDto),
    });
  };

  public viewNotification = async (email: string, notificationId: string) => {
    return sendWithTimeout(this.notificationsClient, 'view-notification', {
      email,
      notificationId,
    });
  };

  public deleteNotifications = async (
    email: string,
    deleteNotificationQueryDto: DeleteNotificationQueryDto,
  ) => {
    return sendWithTimeout(this.notificationsClient, 'delete-notifications', {
      email,
      deleteNotificationQueryDto: toPlain(deleteNotificationQueryDto),
    });
  };
}
