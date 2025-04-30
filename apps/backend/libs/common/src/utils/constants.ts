import { Role } from '@prisma/client';
import { config } from 'dotenv';

config();

export type KeycloakSignUpData = {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type JwtResetPasswordPayload = {
  email: string;
};

export type UserGoogleKeycloakData = {
  sub: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
};

export type GetInfoAuthorizationCode = {
  given_name: string;
  family_name: string;
  access_token: string;
  refresh_token: string;
  provider: 'google' | 'facebook';
};

export type TokensReponse = {
  access_token: string;
  refresh_token: string;
  role: Role;
};

export type SignInResponse = TokensReponse & {
  role: Role;
};

export const DEFAULT_TTL_OTP_EXPIRED = 600000;
export const EMAILS_QUEUE_NAME = 'emails-queue';
export const BULLMQ_RETRY_LIMIT = 3;
export const BULLMQ_RETRY_DELAY = 5000;
export const IS_PRODUCTION =
  process.env.NODE_ENV === 'production' ? true : false;
export const ACCESS_TOKEN_LIFE = 30 * 60 * 1000;
export const REFRESH_TOKEN_LIFE = ACCESS_TOKEN_LIFE * 2;

export enum EmailTemplateNameEnum {
  EMAIL_OTP_VERIFICATION = 'email-otp-verification',
  EMAIL_RESET_PASSWORD = 'email-reset-password',
}

export const SUBJECT_EMAIL_MAP = {
  'email-otp-verification': 'Verify Your Email Address',
  'email-reset-password': 'Reset Your Password',
};

export const KAFKA_SERVICES = [
  { serviceName: 'USERS_SERVICE', clientId: 'users', groupId: 'users-group' },
  {
    serviceName: 'AUTH_SERVICE',
    clientId: 'auth',
    groupId: 'auth-group',
  },
  {
    serviceName: 'EMAILS_SERVICE',
    clientId: 'emails',
    groupId: 'emails-group',
  },
  {
    serviceName: 'REDIS_SERVICE',
    clientId: 'redis',
    groupId: 'redis-group',
  },
] as const;

export enum AuthMethod {
  SIGN_IN = 'sign-in',
  SIGN_UP = 'sign-up',
}
