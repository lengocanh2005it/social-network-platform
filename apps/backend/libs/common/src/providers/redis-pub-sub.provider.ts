import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SseService } from 'apps/api-gateway/src/modules/sse/sse.service';
import Redis from 'ioredis';

@Injectable()
export class RedisPubSubProvider implements OnModuleDestroy, OnModuleInit {
  private readonly pub = new Redis();
  private readonly sub = new Redis();

  constructor(private readonly sseService: SseService) {}

  async onModuleInit() {
    await this.sub.subscribe('notifications');

    this.sub.on('message', (channel, message) => {
      try {
        const payload = JSON.parse(message);
        this.sseService.sendToUser(payload);
      } catch (err) {
        console.error('Failed to parse Redis message: ', err);
      }
    });
  }

  async publish(channel: string, data: any) {
    await this.pub.publish(channel, JSON.stringify(data));
  }

  onModuleDestroy() {
    this.pub.disconnect();
    this.sub.disconnect();
  }
}
