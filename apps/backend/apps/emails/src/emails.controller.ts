import { EmailTemplateNameEnum } from '@app/common/utils';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailsProducer } from 'apps/emails/src/producers';

@Controller()
export class EmailsController {
  constructor(private readonly emailsProducer: EmailsProducer) {}

  @EventPattern('send-email')
  async sendEmail(
    @Payload('email') email: string,
    @Payload('templateName') templateName: EmailTemplateNameEnum,
    @Payload('context') context?: Record<string, any>,
  ) {
    return await this.emailsProducer.sendEmail(email, templateName, context);
  }
}
