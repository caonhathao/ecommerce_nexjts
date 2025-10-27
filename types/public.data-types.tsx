export interface productItemType {
  id: string;
  imageUrl: string;
  title: string;
  minPrice: number;
  rating: number;
  voucher: {
    maxDiscount: number | null | undefined;
    type: string|null;
    value: number|null;
  };
}
