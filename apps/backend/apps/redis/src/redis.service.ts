import Keyv from '@keyv/redis';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Keyv<any>;
  private readonly client: IORedis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('redis_url', '');
    this.redis = new Keyv(redisUrl);
    this.client = new IORedis(redisUrl);
  }

  public async setKey(key: string, data: any, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, data, ttl);
    } else {
      await this.redis.set(key, data);
    }
  }

  public async getKey(key: string) {
    return this.redis.get(key);
  }

  public async delKey(key: string) {
    await this.redis.delete(key);
  }

  public async getKeysByPrefix(prefix: string): Promise<string[]> {
    return this.client.keys(`${prefix}*`);
  }

  onModuleDestroy() {
    this.client.quit();
  }
}
