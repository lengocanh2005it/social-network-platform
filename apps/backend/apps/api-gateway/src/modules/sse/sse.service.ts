import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SseService implements OnModuleDestroy {
  private clients = new Map<string, Subject<any>>();

  connect(userId: string): Observable<any> {
    const subject = new Subject<any>();

    this.clients.set(userId, subject);

    subject.subscribe({
      complete: () => this.clients.delete(userId),
    });

    return subject.asObservable();
  }

  sendToUser(payload: { user_id: string; data: any }) {
    const client = this.clients.get(payload.user_id);

    if (client) {
      client.next({ data: payload.data });
    }
  }

  onModuleDestroy() {
    for (const [, client] of this.clients.entries()) {
      client.complete();
    }

    this.clients.clear();
  }
}
