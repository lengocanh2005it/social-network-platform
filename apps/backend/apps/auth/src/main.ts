import { createKafkaOptions } from '@app/common/configs';
import { KafkaRpcExceptionFilter } from '@app/common/filters';
import { generateKafkaServiceMap, KAFKA_SERVICES } from '@app/common/utils';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import '../../../libs/common/src/configs/sentry.config';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AuthModule);

  const configService = appContext.get(ConfigService);

  const serviceMap = generateKafkaServiceMap(KAFKA_SERVICES);

  const { clientId, groupId } = serviceMap['AUTH_SERVICE'];

  const kafkaOptions = createKafkaOptions(configService, clientId, groupId);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    kafkaOptions,
  );

  app.useGlobalFilters(new KafkaRpcExceptionFilter());

  await app.listen();
}
bootstrap().catch((err) => {
  console.error(err);
});
