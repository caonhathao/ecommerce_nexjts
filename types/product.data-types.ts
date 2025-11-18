export interface SellerProductListItem {
  id: string;
  title: string;
  status: string;
  visibility: string;
  minPrice: string;
  maxPrice: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  shop: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  images: {
    url: string;
    alt?: string | null;
  }[];
}
