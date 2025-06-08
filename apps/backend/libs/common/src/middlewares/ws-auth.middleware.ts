import { KeycloakProvider } from '@app/common/providers';
import { ClientKafka } from '@nestjs/microservices';
import * as cookie from 'cookie';
import { firstValueFrom } from 'rxjs';

export const createWsAuthMiddleware = (
  keycloakProvider: KeycloakProvider,
  usersClient: ClientKafka,
) => {
  return async (socket: any, next: (err?: any) => void) => {
    try {
      usersClient.subscribeToResponseOf('get-user-by-field');

      const cookies = socket.handshake.headers.cookie;

      if (!cookies) {
        return next(new Error('Unauthorized'));
      }

      const { access_token, refresh_token } = cookie.parse(cookies);

      let email = '';

      if (access_token) {
        const payload = await keycloakProvider.verifyToken(access_token);
        email = payload.email;
      } else if (refresh_token) {
        const refreshed = await keycloakProvider.refreshToken(refresh_token);
        const payload = await keycloakProvider.verifyToken(
          refreshed.access_token,
        );
        email = payload.email;
      }

      if (!email) {
        return next(new Error('Unauthorized'));
      }

      const user = await firstValueFrom<any>(
        usersClient.send(
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
        return next(new Error('Unauthorized'));
      }

      socket.data.user = user;

      next();
    } catch (error) {
      console.error('WS Auth error:', error);
      next(new Error('Unauthorized'));
    }
  };
};
