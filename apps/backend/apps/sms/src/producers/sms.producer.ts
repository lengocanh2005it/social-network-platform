import { SendSmsDto } from '@app/common/dtos/sms';
import {
  BULLMQ_RETRY_DELAY,
  BULLMQ_RETRY_LIMIT,
  SMS_QUEUE_NAME,
} from '@app/common/utils';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class SmsProducer {
  constructor(@InjectQueue(SMS_QUEUE_NAME) private readonly smsQueue: Queue) {}

  public sendSMS = async (sendSmsDto: SendSmsDto) => {
    await this.smsQueue.add('send-sms', sendSmsDto, {
      attempts: BULLMQ_RETRY_LIMIT,
      backoff: {
        type: 'exponential',
        delay: BULLMQ_RETRY_DELAY,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  };
}
