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

interface CartItem {
    cartItemId: string;
    variantId: string;
    quantity: number;
}

