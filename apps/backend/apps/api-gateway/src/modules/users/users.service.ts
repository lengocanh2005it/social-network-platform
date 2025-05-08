import { GetUserQueryDto, UpdateUserProfileDto } from '@app/common/dtos/users';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @Inject('USERS_SERVICE') private readonly userClient: ClientKafka,
  ) {}

  onModuleInit() {
    const patterns = ['get-me', 'update-profile'];

    patterns.forEach((pattern) => {
      this.userClient.subscribeToResponseOf(pattern);
    });
  }

  async getMe(email: string, getUserQueryDto?: GetUserQueryDto): Promise<any> {
    return firstValueFrom(
      this.userClient.send('get-me', {
        email,
        getUserQueryDto,
      }),
    );
  }

  async updateUserProfile(
    updateUserProfileDto: UpdateUserProfileDto,
    email: string,
  ): Promise<any> {
    return firstValueFrom(
      this.userClient.send('update-profile', {
        updateUserProfileDto,
        email,
      }),
    );
  }
}
