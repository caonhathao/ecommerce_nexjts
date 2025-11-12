export type OrderDraftType = {
  id: string;
  orderNumber: string;
  itemsTotal: string;
  shippingFee: string;
  discountTotal: string;
  grandTotal: string;
  shippingInfor: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
  };
  items: {
    title: string;
    quantity: number;
    unitPrice: string;
    total: string;
    product: {
      images: {
        url: string;
        alt: string | null;
        position: number;
      }[];
    };
  }[];
};