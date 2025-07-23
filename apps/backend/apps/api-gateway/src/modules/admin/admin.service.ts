import { sendWithTimeout } from '@app/common/utils';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @Inject('ADMIN_SERVICE') private readonly adminClient: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = ['get-stats'];
    patterns.forEach((p) => this.adminClient.subscribeToResponseOf(p));
  }

  public getStats = async () => {
    return sendWithTimeout(this.adminClient, 'get-stats', {});
  };
}
