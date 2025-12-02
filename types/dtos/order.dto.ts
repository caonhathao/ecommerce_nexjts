import { $Enums, FulfillmentStatus } from '@/lib/generated/prisma';
import ProductStatus = $Enums.ProductStatus;
import Visibility = $Enums.Visibility;
import Currency = $Enums.Currency;
import OrderStatus = $Enums.OrderStatus;
import PaymentStatus = $Enums.PaymentStatus;

export type OrderDTO = {
  id: string;
  orderNumber: string;
  userId: string;
  shopId: string | null;

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  currency: Currency;

  itemsTotal: number;
  shippingFee: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;

  shippingAddress: any;
  billingAddress: any | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;

  placedAt: Date;
  updatedAt: Date;
  canceledAt: Date | null;

  items: OrderItemsDTO[];
};

export type OrderItemsDTO = {
  id: string;
  orderId: string | null;
  productId: string;
  shopId: string | null;
  variantId: string | null;

  title: string;
  sku: string | null;

  unitPrice: number;
  quantity: number;
  discount: number;
  total: number;
  metadata: any;

  product: ProductOrderItem;
  productVariant: ProductVariantItem;
};

export type ProductOrderItem = {
  id: string;
  shopId: string;
  categoryId: string | null;
  title: string;
  slug: string;
  origin: string | null;
  description: string | null;
  status: ProductStatus;
  visibility: Visibility;
  attributes: any;

  ratingAvg: number;
  ratingCount: number;
  soldCount: number;
  minPrice: number;
  maxPrice: number;
  currency: Currency;

  createdAt: Date;
  updatedAt: Date;

  images: ProductImageDTO[];
};
export type ProductImageDTO = {
  id: string;
  url: string;
  publicId: string;
  alt?: string | null;
  position: number;
  productId: string;
};

export type ProductVariantItem = {
  image: string;
};
