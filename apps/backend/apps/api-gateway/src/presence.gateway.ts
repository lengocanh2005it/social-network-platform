import { UpdateUserSessionDto } from '@app/common/dtos/users';
import { createWsAuthMiddleware } from '@app/common/middlewares';
import { KeycloakProvider } from '@app/common/providers';
import { DEFAULT_TTL_ONLINE } from '@app/common/utils';
import { Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SessionStatusEnum } from '@repo/db';
import { firstValueFrom } from 'rxjs';
import { Server, Socket } from 'socket.io';

const configService = new ConfigService();

@WebSocketGateway({
  namespace: '/ws/presence',
  cors: {
    origin: configService.get<string>('FRONTEND_URL', ''),
    withCredentials: true,
  },
})
export class PresenceGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    OnModuleInit
{
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    @Inject('REDIS_SERVICE') private readonly redisClient: ClientKafka,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientKafka,
    private readonly keycloakProvider: KeycloakProvider,
  ) {}

  onModuleInit() {
    const userPatterns = ['get-user-by-field', 'get-friends'];

    userPatterns.forEach((p) => this.usersClient.subscribeToResponseOf(p));

    this.redisClient.subscribeToResponseOf('get-keys-by-prefix');
  }

  afterInit(server: Server) {
    server.use(createWsAuthMiddleware(this.keycloakProvider, this.usersClient));
  }

  handleConnection(client: Socket) {
    const user = client.data.user;

    this.redisClient.emit(
      'set-key',
      JSON.stringify({
        key: `online:${user.id}`,
        data: '1',
        ttl: DEFAULT_TTL_ONLINE,
      }),
    );

    this.server.emit('friend-online', { user_id: user.id });

    console.log(
      `User ${user?.profile?.first_name ?? ''} ${user?.profile?.last_name ?? ''} is now online.`,
    );
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;

    if (!user) {
      client.disconnect();
      return;
    }

    const sockets = await this.server.in(user.id).fetchSockets();

    if (!sockets.length) {
      const updateUserSessionDto: UpdateUserSessionDto = {
        user_id: user.id,
        finger_print: user.fingerprint,
        status: SessionStatusEnum.inactive,
        is_online: false,
        last_seen_at: new Date(),
      };

      this.usersClient.emit(
        'update-user-session',
        JSON.stringify(updateUserSessionDto),
      );

      this.redisClient.emit('del-key', `online:${user.id}`);

      this.server.emit('friend-offline', { user_id: user.id });

      console.log(
        `User ${user?.profile?.first_name ?? ''} ${user?.profile?.last_name ?? ''} is now offline.`,
      );
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    const user_id = client?.data?.user?.id;
    const fingerprint = client?.data?.user?.fingerprint;

    if (user_id) {
      const updateUserSessionDto: UpdateUserSessionDto = {
        user_id,
        finger_print: fingerprint,
        status: SessionStatusEnum.active,
        is_online: true,
        last_seen_at: new Date(),
      };

      this.usersClient.emit(
        'update-user-session',
        JSON.stringify(updateUserSessionDto),
      );

      this.redisClient.emit(
        'set-key',
        JSON.stringify({
          key: `online:${user_id}`,
          data: '1',
          ttl: DEFAULT_TTL_ONLINE,
        }),
      );
    }
  }

  @SubscribeMessage('get-online-friends')
  async getOnlineFriends(@ConnectedSocket() client: Socket) {
    const email = client.data?.user?.email;

    if (!email) {
      client.disconnect();
      return;
    }

    const friendIds = await firstValueFrom<string[]>(
      this.usersClient.send('get-friends', {
        email,
      }),
    );

    const keys = await firstValueFrom<string[]>(
      this.redisClient.send('get-keys-by-prefix', 'online:'),
    );

    const onlineUserIds = keys.map((key) => key.replace('online:', ''));

    const onlineFriends = friendIds.filter((friendId) =>
      onlineUserIds.includes(friendId),
    );

    client.emit('online-friends', onlineFriends);
  }
}
