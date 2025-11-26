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

export interface productDataResponse {
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

export interface shopDataResponse {
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

export interface categoryDataFormResponse {
  data: categoryDataFormItem[];
}

export interface categoryDataFormItem {
  id: string;
  name: string;
  children: categoryDataFormItem[];
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

export interface categoryDetail {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  imageUrl: string;
  parentId: string | null;
  parent: {
    id: string;
    name: string;
    slug: string;
  };
  children: {
    id: string;
    name: string;
    slug: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface categoryChildDetail {
  id: string;
  name: string;
  slug: string;
}

export interface userDataResponse {
  data: userItemData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface userItemData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface userDetail {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  banned: boolean;
  banReasion: string | null;
  banExpires: string | null;
  profile: {
    emailForBill: string;
    phone: string | null;
    gender: string | null;
  };
  shopsOwned: {
    id: string;
    name: string;
    logoUrl: string;
  }[];
  shopMemberships: {
    shop: {
      id: string;
      name: string;
      logoUrl: string;
    };
  }[];
}

export type responseData =
  | categoryDataResponse
  | shopDataResponse
  | productDataResponse;

export type itemData = categoryItemData | productItemData | shopItemData;
