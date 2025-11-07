export interface productItemData {
  id: string;
  title: string;
  status: string;
  visibility: string;
  shop: {
    id: string;
    logoUrl: string;
    name: string;
  };
  _count: {
    variants: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface productData {
  data: productItemData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface productDetail {
  id: string;
  shop: {
    id: string;
    name: string;
    logoUrl: string;
  };
  title: string;
  slug: string;
  origin: string;
  description: string;
  status: string;
  visibility: string;
  attributes: string;
  minPrice: string;
  maxPrice: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  images: {
    url: string;
    alt: string;
  }[];
  variants: {
    id: string;
    sku: string;
    name: string;
    price: string;
    image: string;
    currency: string;
    attributes: string;
    createdAt: string;
    updatedAt: string;
  }[];
}
