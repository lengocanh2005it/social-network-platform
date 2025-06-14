import {
  CreateNotificationDto,
  DeleteNotificationQueryDto,
  GetNotificationQueryDto,
} from '@app/common/dtos/notifications';
import { RedisPubSubProvider } from '@app/common/providers';
import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly redisPubSubProvider: RedisPubSubProvider,
  ) {}

  @EventPattern('create-notification')
  async createNotification(
    @Payload() createNotificationDto: CreateNotificationDto,
  ) {
    const { recipient_id } = createNotificationDto;

    const data = await this.notificationsService.createNotification(
      createNotificationDto,
    );

    await this.redisPubSubProvider.publish('notifications', {
      user_id: recipient_id,
      data,
    });
  }

  @MessagePattern('get-notifications')
  async getNotifications(
    @Payload('email') email: string,
    @Payload('getNotificationQueryDto')
    getNotificationQueryDto: GetNotificationQueryDto,
  ) {
    return this.notificationsService.getNotifications(
      email,
      getNotificationQueryDto,
    );
  }

  @MessagePattern('view-notification')
  async viewNotification(
    @Payload('email') email: string,
    @Payload('notificationId') notificationId: string,
  ) {
    return this.notificationsService.viewNotification(email, notificationId);
  }

  @MessagePattern('delete-notifications')
  async deleteNotifications(
    @Payload('email') email: string,
    @Payload('deleteNotificationQueryDto')
    deleteNotificationQueryDto: DeleteNotificationQueryDto,
  ) {
    return this.notificationsService.deleteNotifications(
      email,
      deleteNotificationQueryDto,
    );
  }
}
