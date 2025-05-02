import { GetUserQueryDto } from '@app/common/dtos/users';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @Inject('USERS_SERVICE') private readonly userClient: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = ['get-me'];

    patterns.forEach((pattern) => {
      this.userClient.subscribeToResponseOf(pattern);
    });
  }

  async getMe(email: string, getUserQueryDto?: GetUserQueryDto): Promise<any> {
    return lastValueFrom(
      this.userClient.send('get-me', {
        email,
        getUserQueryDto,
      }),
    );
  }
}
