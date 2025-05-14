import { SessionStatus } from '.prisma/client';
import { PrismaService } from '@app/common/modules/prisma/prisma.service';
import { KeycloakProvider } from '@app/common/providers';
import { DEFAULT_ERROR_MESSAGE, verifyPassword } from '@app/common/utils';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly keycloakProvider: KeycloakProvider,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refresh_token;

      const accessToken = req.cookies?.access_token;

      const fingerPrint = req.headers['x-fingerprint'] as string;

      const { email } = await this.keycloakProvider.verifyToken(accessToken);

      if (!refreshToken || !fingerPrint || !accessToken || !email)
        throw new HttpException(
          'Your session could not be verified. Kindly sign in again to ensure a seamless experience.',
          HttpStatus.UNAUTHORIZED,
        );

      const sessions = await this.prismaService.userSessions.findMany({
        where: {
          finger_print: fingerPrint,
          status: SessionStatus.active,
          user: {
            email,
          },
        },
      });

      const matchedSession = sessions.find((session) =>
        verifyPassword(refreshToken, session.refresh_token),
      );

      if (!matchedSession)
        throw new HttpException(
          `We couldn't verify your session. Please sign in again to continue securely.`,
          HttpStatus.UNAUTHORIZED,
        );

      if (accessToken && !req.header['authorization'])
        req.headers['authorization'] = `Bearer ${accessToken}`;

      next();
    } catch (error) {
      console.error(error);

      const statusCode = error?.error?.statusCode || error?.status || 500;

      const message =
        error?.error?.message || error?.response || DEFAULT_ERROR_MESSAGE;

      throw new HttpException(message, statusCode);
    }
  }
}
