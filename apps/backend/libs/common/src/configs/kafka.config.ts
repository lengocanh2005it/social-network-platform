import {
  generateKafkaIds,
  KAFKA_MAX_FLIGHT_REQUESTS_DEFAULT,
  KAFKA_METADATA_MAX_AGE,
  KAFKA_RETRY_DEFAULT,
  KAFKA_RETRY_TIME_INITIAL_DEFAULT,
  KAFKA_RETRY_TIME_MAX_DEFAULT,
} from '@app/common/utils';
import { ConfigService } from '@nestjs/config';
import { KafkaOptions, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';

export function createKafkaOptions(
  configService: ConfigService,
  clientId: string,
  groupId: string,
): KafkaOptions {
  const brokers = configService.get<string>('kafka.brokers')?.split(',') || [
    'localhost:9092',
  ];

  const { clientId: newClientId, groupId: newGroupId } = generateKafkaIds(
    clientId,
    groupId,
  );

  return {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: newClientId,
        brokers,
        retry: {
          retries: KAFKA_RETRY_DEFAULT,
          initialRetryTime: KAFKA_RETRY_TIME_INITIAL_DEFAULT,
          maxRetryTime: KAFKA_RETRY_TIME_MAX_DEFAULT,
        },
      },
      consumer: {
        groupId: newGroupId,
      },
      producer: {
        createPartitioner: Partitioners.LegacyPartitioner,
        maxInFlightRequests: KAFKA_MAX_FLIGHT_REQUESTS_DEFAULT,
        metadataMaxAge: KAFKA_METADATA_MAX_AGE,
      },
    },
  };
}
