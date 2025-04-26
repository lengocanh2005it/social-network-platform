import Keyv from '@keyv/redis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private readonly redis: Keyv<any>;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Keyv(configService.get<string>('redis_url', ''));
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
}
