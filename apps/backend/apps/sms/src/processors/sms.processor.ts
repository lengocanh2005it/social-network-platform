import { SMS_QUEUE_NAME, SmsContentType } from '@app/common/utils';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { SmsService } from 'apps/sms/src/sms.service';
import { Job } from 'bullmq';

@Processor(SMS_QUEUE_NAME)
export class SmsProcessor extends WorkerHost {
  constructor(private readonly smsService: SmsService) {
    super();
  }

  async process(job: Job<SmsContentType>): Promise<any> {
    const { message, to } = job.data;

    console.log(
      `Processing job '${job.name}': Sending message '${message}' to phone number '${to}'...`,
    );

    await this.smsService.sendSMS(job.data);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job '${job.name}' completed.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    console.log(`Job '${job.name} failed due to: `, err);
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    if (job.attemptsMade > 0) {
      console.error(
        `Retrying job '${job.name}', attempt: ${job.attemptsMade + 1}`,
      );
    }
  }
}
