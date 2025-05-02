import { verifyTokenWithKeycloak } from '@app/common/utils';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsValidAccessToken(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidAccessToken',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(value: string) {
          if (!value) return false;

          return await verifyTokenWithKeycloak(value);
        },
        defaultMessage(validationArguments?: ValidationArguments): string {
          return 'Invalid access token.';
        },
      },
    });
  };
}
