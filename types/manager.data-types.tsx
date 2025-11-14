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
  soldCount: number;
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

export interface variantDetail {
  id: string;
  sku: string;
  name: string;
  price: string;
  image: string;
  currency: string;
  attributes: string;
  createdAt: string;
  updatedAt: string;
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
  variants: variantDetail[];
}

export interface shopItemData {
  id: string;
  name: string;
  status: string;
  owner: {
    id: string;
    image: string;
    name: string;
  };
  ratingAvg: string;
  ratingCount: string;
  createdAt: string;
  updatedAt: string;
}

export interface shopData {
  data: shopItemData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface shopMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
}

export interface shopDetail {
  id: string;
  owner: {
    id: string;
    name: string;
    email: string;
    image: string;
    createdAt: string;
    updatedAt: string;
  };
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  status: string;
  ratingAvg: string;
  ratingCount: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
  members: shopMember[];
}

export interface revenueEleChart {
  date: Date;
  total: number;
}

export interface orderStatusRateChart {
  label: string;
  total: number;
  fill: string;
}

export interface topProductChart {
  productId: string;
  title: string;
  totalQuantity: number;
}

export interface categoryDataResponse {
  data: categoryItemData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface categoryItemData {
  createdAt: string;
  id: string;
  isActive: boolean;
  name: string;
  parentId: string | null;
  position: number;
  slug: string;
  updatedAt: string;
  _count: {
    children: number;
  };
}
