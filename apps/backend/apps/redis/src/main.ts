import { generateKafkaServiceMap, KAFKA_SERVICES } from '@app/common/utils';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RedisModule } from 'apps/redis/src/redis.module';
import { Partitioners } from 'kafkajs';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(RedisModule);

  const configService = appContext.get(ConfigService);

  const kafkaBrokers = configService
    .get<string>('kafka.brokers', 'localhost:9092')
    ?.split(',');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    RedisModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId:
            generateKafkaServiceMap(KAFKA_SERVICES)['REDIS_SERVICE'].clientId,
          brokers: kafkaBrokers,
        },
        consumer: {
          groupId:
            generateKafkaServiceMap(KAFKA_SERVICES)['REDIS_SERVICE'].groupId,
        },
        producer: {
          createPartitioner: Partitioners.LegacyPartitioner,
        },
      },
    },
  );

  await app.listen();
}
bootstrap().catch((err) => {
  console.error(err);
});
