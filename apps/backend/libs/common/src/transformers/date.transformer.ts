import { Transform } from 'class-transformer';

export const TransformToDate = () =>
  Transform(({ value }) => {
    if (!value) return undefined;

    if (value instanceof Date) return value;

    if (typeof value === 'string') {
      const date = new Date(value);

      return isNaN(date.getTime()) ? undefined : date;
    }

    return undefined;
  });
