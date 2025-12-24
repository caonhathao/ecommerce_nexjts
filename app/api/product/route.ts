import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';
import { ResponseFactory } from '@/lib/api-response';
import { HttpStatus } from '@/types/api';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.max(1, Number(searchParams.get('limit')) || 10);
    const skip = (page - 1) * limit;

    const type = searchParams.get('type') || 'default';

    const whereCondition: Prisma.ProductWhereInput = {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    };

    if (type === 'deal') {
      whereCondition.VoucherProduct = {
        some: {
          voucher: {
            isActive: true,
            type: { in: ['PERCENT', 'FIXED'] },
          },
        },
      };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where: whereCondition }),
      prisma.product.findMany({
        where: whereCondition,
        select: {
          id: true,
          title: true,
          minPrice: true,
          ratingAvg: true,
          ratingCount: true,
          soldCount: true,
          description: true,
          origin: true,
          images: {
            take: 1,
            select: { url: true },
          },
          VoucherProduct: {
            take: 1,
            where: { voucher: { isActive: true } },
            select: {
              voucher: {
                select: {
                  type: true,
                  value: true,
                  maxDiscount: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy:
          type === 'deal'
            ? { soldCount: 'desc' }
            : type === 'new'
              ? { createdAt: 'desc' }
              : type === 'suggest'
                ? { updatedAt: 'desc' }
                : { createdAt: 'desc' },
      }),
    ]);

    const formatted = products.map((p) => ({
      id: p.id,
      title: p.title,
      minPrice: Number(p.minPrice),
      ratingAvg: p.ratingAvg,
      ratingCount: p.ratingCount,
      description: p.description,
      imageUrl: p.images[0]?.url ?? null,
      voucher: p.VoucherProduct[0]?.voucher ?? null,
      origin: p.origin,
    }));

    return ResponseFactory.toNextResponse(
      ResponseFactory.paginated({
        data: formatted,
        total,
        page,
        limit,
        code: HttpStatus.OK,
      })
    );
  } catch (error) {
    return ResponseFactory.toNextResponse(ResponseFactory.handleError(error));
  }
}
