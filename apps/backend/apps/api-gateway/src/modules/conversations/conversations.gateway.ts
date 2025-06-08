import { createWsAuthMiddleware } from '@app/common/middlewares';
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
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const configService = new ConfigService();

@WebSocketGateway({
  namespace: '/ws/conversations',
  cors: {
    origin: configService.get<string>('FRONTEND_URL', ''),
    withCredentials: true,
  },
})
export class ConversationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server: Server;

  constructor(
    private readonly keycloakProvider: KeycloakProvider,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientKafka,
  ) {}

  afterInit(server: Server) {
    server.use(createWsAuthMiddleware(this.keycloakProvider, this.usersClient));
  }

  handleConnection(client: Socket) {
    const user = client.data.user;
    client.join(user.id);
  }

  handleDisconnect(client: Socket) {
    const user = client.data.user;
    client.leave(user.id);
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
