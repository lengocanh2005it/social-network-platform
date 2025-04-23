import { generateKafkaServiceMap, KAFKA_SERVICES } from '@app/common/utils';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { AuthModule } from './auth.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AuthModule);

  const configService = appContext.get(ConfigService);

  const kafkaBrokers = configService
    .get<string>('kafka.brokers', 'localhost:9092')
    ?.split(',');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId:
            generateKafkaServiceMap(KAFKA_SERVICES)['AUTH_SERVICE'].clientId,
          brokers: kafkaBrokers,
        },
        consumer: {
          groupId:
            generateKafkaServiceMap(KAFKA_SERVICES)['AUTH_SERVICE'].groupId,
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
