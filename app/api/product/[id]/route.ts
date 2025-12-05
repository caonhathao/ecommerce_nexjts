import { prisma } from '@/lib/db';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const now = new Date();

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
            ratingAvg: true,
            ratingCount: true,
            slug: true,
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
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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
            image: true,
            sku: true,
            price: true,
            stock: true,
            attributes: true,
            name: true,
          },
        },
        VoucherProduct: {
          where: {
            voucher: {
              isActive: true,
              startAt: { lte: now },
              endAt: { gte: now },
            },
          },
          select: {
            voucher: {
              select: {
                id: true,
                code: true,
                type: true,
                value: true,
                maxDiscount: true,
                minSubtotal: true,
                startAt: true,
                endAt: true,
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

    console.log(
      `[GET /api/product/${id}] data: ${JSON.stringify(data, null, 2)}`
    );

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
