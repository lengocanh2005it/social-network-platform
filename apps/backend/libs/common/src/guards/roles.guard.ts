import {
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { RoleGuard as KeycloakRoleGuard } from 'nest-keycloak-connect';

@Injectable()
export class RoleGuard extends KeycloakRoleGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isValid = await super.canActivate(context);

      if (!isValid)
        throw new HttpException(
          'You do not have the required role to access this resource.',
          HttpStatus.FORBIDDEN,
        );

      return isValid;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }
}
