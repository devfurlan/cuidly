import { Prisma } from '@prisma/client';

export function serializeDecimals<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      value instanceof Prisma.Decimal ? value.toNumber() : value,
    ),
  ) as T;
}
