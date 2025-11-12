import {Prisma} from "@/lib/generated/prisma";

export interface AddToCartRequest{
    variantId: string;
    quantity: number;
    priceSnap: Prisma.Decimal;
    currency: "VND";
}

export interface UpdateCartRequest {
    items: CartItem[];
}

export type CartType = {
  id: string;
  userId: string;
  items: CartItem[];
};

export type CartItem = {
  id: string;
  quantity: number;
  priceSnap: number;
  variant: Variant;
};

export type Variant = {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAt: number | null;
  stock: number;
  product: Product;
};

export type Product = {
  title: string;
  slug: string;
  images: ProductImage[];
};

export type ProductImage = {
  url: string;
  alt: string;
  position: number;
};

