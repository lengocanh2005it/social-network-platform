import { SessionStatus } from '.prisma/client';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import { KeycloakProvider } from '@app/common/providers';
import {
  ACCESS_TOKEN_LIFE,
  DEFAULT_ERROR_MESSAGE,
  initializeCookies,
  IS_PRODUCTION,
  verifyPassword,
} from '@app/common/utils';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { SessionStatusEnum } from '@repo/db';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly keycloakProvider: KeycloakProvider,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientKafka,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refresh_token;
      const accessToken = req.cookies?.access_token;
      const role = req.cookies?.role;
      const fingerPrint = req.headers['x-fingerprint'] as string;
      const user_id = req.headers['user_id'] as string | undefined;

      if (!fingerPrint)
        throw new HttpException(
          'Fingerprint is required to verify your session. Please try again or log in again.',
          HttpStatus.UNAUTHORIZED,
        );

      if (!accessToken && !refreshToken) {
        if (user_id?.trim()) {
          this.usersClient.emit(
            'update-user-session',
            JSON.stringify({
              user_id,
              finger_print: fingerPrint,
              status: SessionStatusEnum.inactive,
            }),
          );
        }

        Object.keys(req.cookies).forEach((cookieName) => {
          res.clearCookie(cookieName);
        });

        throw new HttpException(
          'Missing access and refresh tokens. Please log in again.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (accessToken) {
        try {
          await this.keycloakProvider.verifyToken(accessToken);
          req.headers['authorization'] = `Bearer ${accessToken}`;
          if (!role) {
            const role =
              await this.keycloakProvider.getRolesKeycloak(accessToken);

            res.cookie('role', role, {
              httpOnly: false,
              secure: IS_PRODUCTION ? true : false,
              sameSite: 'lax',
              maxAge: ACCESS_TOKEN_LIFE,
            });
          }
          return next();
        } catch (err) {
          if (err.name !== 'TokenExpiredError') {
            throw new HttpException(
              'Invalid access token.',
              HttpStatus.UNAUTHORIZED,
            );
          }
        }
      }

      if (refreshToken) {
        const sessions = await this.prismaService.userSessions.findMany({
          where: {
            finger_print: fingerPrint,
            status: SessionStatus.active,
          },
          include: {
            user: true,
          },
        });

        const matchedSession = sessions.find((session) =>
          verifyPassword(refreshToken, session.refresh_token),
        );

        if (!matchedSession) {
          throw new HttpException(
            `We couldn't verify your session. Please sign in again to continue securely.`,
            HttpStatus.UNAUTHORIZED,
          );
        }

        const { access_token, refresh_token } =
          await this.keycloakProvider.refreshToken(refreshToken);

        req.headers['authorization'] = `Bearer ${access_token}`;

        initializeCookies(res, {
          access_token,
          refresh_token,
          role: await this.keycloakProvider.getRolesKeycloak(access_token),
        });

        return next();
      }

      Object.keys(req.cookies).forEach((cookieName) => {
        res.clearCookie(cookieName);
      });

      throw new HttpException(
        'Your session has expired. Please log in again.',
        HttpStatus.UNAUTHORIZED,
      );
    } catch (error) {
      console.error(error);

      const statusCode =
        error?.error?.statusCode ||
        error?.status ||
        HttpStatus.INTERNAL_SERVER_ERROR;

      const message =
        error?.error?.message || error?.response || DEFAULT_ERROR_MESSAGE;

      throw new HttpException(message, statusCode);
    }
  }
}
