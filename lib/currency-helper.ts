import { Decimal } from '@/lib/generated/prisma/runtime/library';

export function vndToUsdCents(
  vnd: Decimal | number | string,
  rate: Decimal | number | string
): Decimal {
  const vndDecimal = new Decimal(vnd);
  const rateDecimal = new Decimal(rate);

  const usd = vndDecimal.div(rateDecimal);
  const cents = usd.mul(100);
  return cents.toDecimalPlaces(0);
}
