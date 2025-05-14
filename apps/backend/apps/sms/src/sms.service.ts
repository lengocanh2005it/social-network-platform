import { SendSmsDto } from '@app/common/dtos/sms';
import { formatPhoneNumberToE164 } from '@app/common/utils';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { TwilioService } from 'nestjs-twilio';

@Injectable()
export class SmsService {
  constructor(private readonly twilioService: TwilioService) {}

  public sendSMS = async (sendSmsDto: SendSmsDto) => {
    try {
      const { from, to, message } = sendSmsDto;

      const response = await this.twilioService.client.messages.create({
        from,
        to: formatPhoneNumberToE164(to),
        body: message,
      });

      if (!response)
        throw new RpcException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to receive response from Twilio',
        });
    } catch (error) {
      console.error(error);

      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error?.message || 'Unknown error',
      });
    }
  };
}
