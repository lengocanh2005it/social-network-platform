import { createKafkaOptions } from '@app/common/configs';
import { generateKafkaServiceMap, KAFKA_SERVICES } from '@app/common/utils';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { SmsModule } from './sms.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SmsModule);

  const configService = appContext.get(ConfigService);

  const serviceMap = generateKafkaServiceMap(KAFKA_SERVICES);

  const { clientId, groupId } = serviceMap['SMS_SERVICE'];

  const kafkaOptions = createKafkaOptions(configService, clientId, groupId);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SmsModule,
    kafkaOptions,
  );

  await app.listen();
}
bootstrap().catch((err) => {
  console.error(err);
});
