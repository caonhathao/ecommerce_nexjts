import {withAuth} from "@/lib/with-auth";
import {NextRequest, NextResponse} from "next/server";
import {UpdateCartRequest} from "@/types/cart.data-types";
import {prisma} from "@/lib/db";


export const DELETE = withAuth(async (userId: string, request: NextRequest) => {
    try {
        const body = await request.json();
        const {variantId} = body;

        if (!variantId) {
            return NextResponse.json({error: 'variantId is required'}, {status: 400});
        }

        const cart = await prisma.cart.findUnique({
            where: {userId},
        });

        if (!cart) {
            return NextResponse.json({error: 'Cart not found'}, {status: 404});
        }

        await prisma.cartItem.delete({
            where: {
                cartId_variantId: {
                    cartId: cart.id,
                    variantId,
                },
            },
        });

        return NextResponse.json({message: 'Product removed from cart successfully'}, {status: 200});
    } catch (e) {
        console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', e);

        if (e instanceof Error && e.message.includes('Record not found')) {
            return NextResponse.json({error: 'Item not found in cart'}, {status: 404});
        }

        return NextResponse.json(
            {error: 'Internal server error', details: (e as Error).message},
            {status: 500}
        );
    }
});