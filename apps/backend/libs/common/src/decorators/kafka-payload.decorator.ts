import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

export function KafkaPayloadDto<T extends object>(DtoClass: new () => T) {
  return createParamDecorator(async (_data: unknown, ctx: ExecutionContext) => {
    const payload = ctx.switchToRpc().getData();
    const dto = plainToInstance(DtoClass, payload);
    const errors = await validate(dto);

    if (errors.length > 0) throw new BadRequestException(errors);

    return dto;
  })();
}
