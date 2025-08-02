import { SetMetadata } from '@nestjs/common';
export const SKIP_USER_ACTIVITY_KEY = 'skipUserActivity';
export const SkipUserActivity = () => SetMetadata(SKIP_USER_ACTIVITY_KEY, true);
