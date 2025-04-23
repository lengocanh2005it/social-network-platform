import { Serializer } from '@nestjs/microservices';

export class KafkaRequestSerializer implements Serializer {
  serialize(value: any) {
    return {
      value: JSON.stringify(value),
    };
  }
}
