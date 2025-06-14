import {
  Controller,
  Param,
  ParseUUIDPipe,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { SseService } from './sse.service';
import { Observable } from 'rxjs';
import { Public } from 'nest-keycloak-connect';

@Controller('notifications/sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse(':userId')
  @Public()
  sse(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Observable<MessageEvent> {
    return this.sseService.connect(userId);
  }
}
