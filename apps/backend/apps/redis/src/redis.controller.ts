import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { RedisService } from './redis.service';

@Controller()
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @EventPattern('set-key')
  async setKey(@Payload() payload: Record<string, any>) {
    const { key, data, ttl } = payload;

    return this.redisService.setKey(key, data, ttl);
  }

  @MessagePattern('get-key')
  async getKey(@Payload() key: string) {
    return this.redisService.getKey(key);
  }

  @EventPattern('del-key')
  async delKey(@Payload() key: string) {
    return this.redisService.delKey(key);
  }

  @MessagePattern('get-keys-by-prefix')
  async getKeysByPrefix(@Payload() prefix: string) {
    return this.redisService.getKeysByPrefix(prefix);
  }
}
