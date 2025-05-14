import { SendSmsDto } from '@app/common/dtos/sms';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SmsProducer } from 'apps/sms/src/producers';

@Controller()
export class SmsController {
  constructor(private readonly smsProducer: SmsProducer) {}

  @EventPattern('send-sms')
  async sendSMS(@Payload() sendSmsDto: SendSmsDto) {
    return this.smsProducer.sendSMS(sendSmsDto);
  }
}
