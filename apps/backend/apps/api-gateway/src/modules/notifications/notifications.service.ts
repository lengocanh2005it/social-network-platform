import {
  DeleteNotificationQueryDto,
  GetNotificationQueryDto,
} from '@app/common/dtos/notifications';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

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
    return firstValueFrom(
      this.notificationsClient.send('get-notifications', {
        email,
        getNotificationQueryDto,
      }),
    );
  };

  public viewNotification = async (email: string, notificationId: string) => {
    return firstValueFrom(
      this.notificationsClient.send('view-notification', {
        email,
        notificationId,
      }),
    );
  };

  public deleteNotifications = async (
    email: string,
    deleteNotificationQueryDto: DeleteNotificationQueryDto,
  ) => {
    return firstValueFrom(
      this.notificationsClient.send('delete-notifications', {
        email,
        deleteNotificationQueryDto,
      }),
    );
  };
}
