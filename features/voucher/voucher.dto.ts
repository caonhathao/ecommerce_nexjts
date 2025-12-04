import { $Enums } from '@/lib/generated/prisma';
import VoucherType = $Enums.VoucherType;
import Currency = $Enums.Currency;

export type VoucherResponseDTO = {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  maxDiscount: number | null;
  minSubtotal: number | null;
  currency: Currency;

  startAt: Date;
  endAt: Date;

  usageLimit: number | null;
  perUserLimit: number | null;
  isActive: boolean;

  shopId: string | null;

  appliedProducts?: { id: string; name: string }[];
  appliedCategories?: { id: string; name: string }[];
};

export type VoucherResponseData = {
  vouchers: VoucherResponseDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
