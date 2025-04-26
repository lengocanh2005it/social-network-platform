import { JwtService } from '@nestjs/jwt';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsValidJwt(
  secretOrPublicKey: string,
  validationOptions?: ValidationOptions,
) {
  const jwtService = new JwtService();

  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidJwt',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          try {
            jwtService.verify(value, {
              secret: secretOrPublicKey,
            });

            return true;
          } catch (error) {
            return false;
          }
        },
        defaultMessage(_args: ValidationArguments) {
          return 'authorizationCode must be a valid signed JWT token.';
        },
      },
    });
  };
}
