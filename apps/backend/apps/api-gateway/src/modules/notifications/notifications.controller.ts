import {
  DeleteNotificationQueryDto,
  GetNotificationQueryDto,
} from '@app/common/dtos/notifications';
import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { RoleEnum } from '@repo/db';
import { KeycloakUser, Roles } from 'nest-keycloak-connect';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(RoleEnum.admin, RoleEnum.user)
  async getNotifications(
    @KeycloakUser() user: any,
    @Query() getNotificationQueryDto: GetNotificationQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.notificationsService.getNotifications(
      email,
      getNotificationQueryDto,
    );
  }

  @Get(':id')
  @Roles(RoleEnum.admin, RoleEnum.user)
  async viewNotification(
    @Param('id', ParseUUIDPipe) notificationId: string,
    @KeycloakUser() user: any,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.notificationsService.viewNotification(email, notificationId);
  }

  @Delete()
  @Roles(RoleEnum.admin, RoleEnum.user)
  async deleteNotifications(
    @KeycloakUser() user: any,
    @Query() deleteNotificationQueryDto: DeleteNotificationQueryDto,
  ) {
    const { email } = user;

    if (!email || typeof email !== 'string')
      throw new HttpException(
        'Email not found in the access token.',
        HttpStatus.NOT_FOUND,
      );

    return this.notificationsService.deleteNotifications(
      email,
      deleteNotificationQueryDto,
    );
  }
}
