import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class ConversationsService {
  constructor(
    @Inject('CONVERSATIONS_SERVICE')
    private readonly conversationsClient: ClientKafka,
  ) {}
}
