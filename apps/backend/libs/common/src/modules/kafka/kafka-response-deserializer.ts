import { Deserializer } from '@nestjs/microservices';

export class KafkaResponseDeserializer implements Deserializer<any, any> {
  deserialize(message: any) {
    const value = message.value?.toString?.();

    try {
      return JSON.parse(value);
    } catch (err) {
      return value;
    }
  }
}
