import { prisma } from '@/lib/db';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const data = await prisma.product.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        shop: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        title: true,
        description: true,
        attributes: true,
        ratingAvg: true,
        ratingCount: true,
        minPrice: true,
        maxPrice: true,
        soldCount: true,
        images: {
          select: {
            url: true,
            alt: true,
          },
        },
        variants: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            productId: true,
            sku: true,
            price: true,
            stock: true,
            attributes: true,
            name:true
          },
        },
        VoucherProduct: {
          select: {
            voucher: {
              select: {
                id: true,
                type: true,
                value: true,
                maxDiscount: true,
              },
            },
          },
        },
      },
    });

    if (!data) {
      return new Response(JSON.stringify({ message: 'Product not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
