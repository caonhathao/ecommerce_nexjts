export interface VoucherDto {
  id: string;
  code: string;
  type: string;
  value: number;
  minSubtotal: number;
  maxDiscount: number;
  description: string | null;
  startAt: Date;
  endAt: Date;
  shopId: string | null;
}
