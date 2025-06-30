import { CommonModule } from '@app/common';
import { RedisPubSubProvider } from '@app/common/providers';
import { Module } from '@nestjs/common';
import { SseModule } from 'apps/api-gateway/src/modules/sse/sse.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [CommonModule, SseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, RedisPubSubProvider],
})
export class NotificationsModule {}
