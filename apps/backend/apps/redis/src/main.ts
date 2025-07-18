import { createKafkaOptions } from '@app/common/configs';
import { KafkaRpcExceptionFilter } from '@app/common/filters';
import { generateKafkaServiceMap, KAFKA_SERVICES } from '@app/common/utils';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { RedisModule } from 'apps/redis/src/redis.module';
import '../../../libs/common/src/configs/sentry.config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(RedisModule);

  const configService = appContext.get(ConfigService);

  const serviceMap = generateKafkaServiceMap(KAFKA_SERVICES);

  const { clientId, groupId } = serviceMap['REDIS_SERVICE'];

  const kafkaOptions = createKafkaOptions(configService, clientId, groupId);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    RedisModule,
    kafkaOptions,
  );

  app.useGlobalFilters(new KafkaRpcExceptionFilter());

  await app.listen();
}
bootstrap().catch((err) => {
  console.error(err);
});
