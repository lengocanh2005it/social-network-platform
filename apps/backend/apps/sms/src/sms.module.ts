import { CommonModule } from '@app/common';
import { Module } from '@nestjs/common';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { SmsProcessor } from 'apps/sms/src/processors';
import { SmsProducer } from 'apps/sms/src/producers';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SMS_QUEUE_NAME } from '@app/common/utils';

@Module({
  imports: [
    CommonModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('redis_url', 'redis://localhost:6379'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: SMS_QUEUE_NAME,
    }),
  ],
  controllers: [SmsController],
  providers: [SmsService, SmsProcessor, SmsProducer],
})
export class SmsModule {}
