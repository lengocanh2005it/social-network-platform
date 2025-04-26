import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsValidPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsValidPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{6,}$/;

          return typeof value === 'string' && regex.test(value);
        },
        defaultMessage(_args: ValidationArguments) {
          return 'Password must be at least 6 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
        },
      },
    });
  };
}
