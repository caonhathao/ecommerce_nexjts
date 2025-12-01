import { $Enums } from '@/lib/generated/prisma';
import VoucherType = $Enums.VoucherType;
import { Decimal } from '@/lib/generated/prisma/runtime/library';

export type VoucherDTO = {
  id: string;
  code: string;
  type: VoucherType;
  value: Decimal;
};
