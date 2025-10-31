export interface productItemType {
  id: string;
  imageUrl: string;
  title: string;
  minPrice: number;
  ratingAvg: number;
  voucher: {
    maxDiscount: number | null | undefined;
    type: string | null;
    value: number | null;
  };
}

export interface productDetailType {
  VoucherProduct: {
    id: string;
    description: string;
    voucher: {
      id: string;
      maxDiscount: string;
      type: string;
      value: string;
    };
  }[];
  attributes: string | null;
  description: string;
  id: string;
  title: string;
  soldCount: string;
  images: {
    url: string;
    alt: string;
  }[];
  maxPrice: string;
  minPrice: string;
  ratingCount: 0;
  ratingAvg: 0;
  shop: {
    id: string;
    logoUrl: string;
    name: string;
  };
  variants: {
    attributes: string | null;
    id: string;
    price: string;
    productId: string;
    sku: string;
    stock: number;
    name: string;
  }[];
}

export interface reviewsType {
  body: string;
  createdAt: string;
  id: string;
  likes: number;
  rating: number;
  title: string;
  images: JSON | null;
  user: {
    id: string;
    image: string;
    name: string;
  };
}
