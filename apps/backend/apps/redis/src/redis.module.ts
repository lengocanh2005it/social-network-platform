import { CommonModule } from '@app/common';
import { RedisModule as RedisProviderModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisController } from './redis.controller';
import { RedisService } from './redis.service';

@Module({
  imports: [
    CommonModule,
    RedisProviderModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.get<string>('redis_url', ''),
      }),
    }),
  ],
  controllers: [RedisController],
  providers: [RedisService],
})
export class RedisModule {}
