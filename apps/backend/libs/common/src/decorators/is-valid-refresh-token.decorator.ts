import { verifyTokenWithKeycloak } from '@app/common/utils';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsValidRefreshToken(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidRefreshToken',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(value: string) {
          if (!value) return false;
          return await verifyTokenWithKeycloak(value);
        },
        defaultMessage(validationArguments?: ValidationArguments): string {
          return 'Refresh token is not valid';
        },
      },
    });
  };
}
