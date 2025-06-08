import { KeycloakProvider } from '@app/common/providers';
import { Message } from '@app/common/utils';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as cookie from 'cookie';
import { firstValueFrom } from 'rxjs';
import { Server, Socket } from 'socket.io';

const configService = new ConfigService();

@WebSocketGateway({
  cors: {
    origin: configService.get<string>('FRONTEND_URL', ''),
    withCredentials: true,
  },
})
export class ConversationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  readonly server: Server;

  constructor(
    private readonly keycloakProvider: KeycloakProvider,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientKafka,
  ) {}

  async handleConnection(client: Socket) {
    this.usersClient.subscribeToResponseOf('get-user-by-field');

    const cookies = client.handshake.headers.cookie;

    if (!cookies) {
      client.disconnect();
      return;
    }

    const { access_token, refresh_token } = cookie.parse(cookies);

    if (!access_token && !refresh_token) {
      client.disconnect();
      return;
    }

    try {
      let email: string = '';

      if (access_token) {
        const payload = await this.keycloakProvider.verifyToken(access_token);

        email = payload.email;
      } else if (refresh_token) {
        const refreshed =
          await this.keycloakProvider.refreshToken(refresh_token);

        const payload = await this.keycloakProvider.verifyToken(
          refreshed.access_token,
        );

        email = payload.email;
      }

      if (!email) {
        client.disconnect();
        return;
      }

      const user = await firstValueFrom<any>(
        this.usersClient.send(
          'get-user-by-field',
          JSON.stringify({
            field: 'email',
            value: email,
            getUserQueryDto: {
              includeProfile: true,
            },
          }),
        ),
      );

      if (!user) {
        client.disconnect();
        return;
      }

      client.data.email = user.email;

      client.join(user.id);

      console.log(
        `User ${user?.profile?.first_name ?? ''} ${user?.profile?.last_name ?? ''} is now online.`,
      );
    } catch (err) {
      console.error(err);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const email: string = client?.data?.email;

    const user = await firstValueFrom<any>(
      this.usersClient.send(
        'get-user-by-field',
        JSON.stringify({
          field: 'email',
          value: email,
          getUserQueryDto: {
            includeProfile: true,
          },
        }),
      ),
    );

    if (!user) {
      client.disconnect();
      return;
    }

    console.log(
      `User ${user?.profile?.first_name ?? ''} ${user?.profile?.last_name ?? ''} is now offline.`,
    );
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @MessageBody()
    data: {
      newMessage: Message;
      target_id: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { target_id, newMessage } = data;

    this.server.to(target_id).emit('newMessage', newMessage);

    client.emit('newMessage', newMessage);
  }
}
