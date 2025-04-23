export type KeycloakSignUpData = {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
};

export const DEFAULT_TTL_OTP_EXPIRED = 600000;
export const EMAILS_QUEUE_NAME = 'emails-queue';
export const BULLMQ_RETRY_LIMIT = 3;
export const BULLMQ_RETRY_DELAY = 5000;

export enum EmailTemplateNameEnum {
  EMAIL_OTP_VERIFICATION = 'email-otp-verification',
}

export const SUBJECT_EMAIL_MAP = {
  'email-otp-verification': 'Verify Your Email Address',
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
