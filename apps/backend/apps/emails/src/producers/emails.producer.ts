import {
  BULLMQ_RETRY_DELAY,
  BULLMQ_RETRY_LIMIT,
  EMAILS_QUEUE_NAME,
  EmailTemplateNameEnum,
} from '@app/common/utils';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class EmailsProducer {
  constructor(
    @InjectQueue(EMAILS_QUEUE_NAME) private readonly emailsQueue: Queue,
  ) {}

  async sendEmail(
    email: string,
    templateName: EmailTemplateNameEnum,
    context?: Record<string, any>,
  ) {
    await this.emailsQueue.add(
      'send-email',
      { email, templateName, context },
      {
        attempts: BULLMQ_RETRY_LIMIT,
        backoff: { type: 'exponential', delay: BULLMQ_RETRY_DELAY },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }
}
