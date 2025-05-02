import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsCodeFormat(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCodeFormat',
      target: (object as any).constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          const uuidPattern =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

          const parts = value.split('.');

          return (
            parts.length === 3 && parts.every((part) => uuidPattern.test(part))
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid code format (UUID.UUID.UUID).`;
        },
      },
    });
  };
}
