import { ResponseFactory } from '@/lib/api-response';
import { getOrderStats } from '@/features/order/order.service';
import { requireSeller } from '@/lib/require-role';
import { GetOrderStatsSchema } from '@/features/order/order.dto';

export async function GET(req: Request) {
  try {
    const session = await requireSeller();
    if (!session?.user?.id) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('Unauthorized', 401)
      );
    }

    const { searchParams } = new URL(req.url);

    const rawInput = {
      shopId: searchParams.get('shopId') || 'all',
      days: searchParams.get('days'),
    };

    const validation = GetOrderStatsSchema.safeParse(rawInput);

    if (!validation.success) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error(
          'Invalid parameters',
          400,
          validation.error.flatten().fieldErrors
        )
      );
    }

    const stats = await getOrderStats(session.user.id, validation.data);

    return ResponseFactory.toNextResponse(ResponseFactory.success(stats));
  } catch (err: any) {
    const status = err?.message === 'Unauthorized' ? 401 : 500;
    return ResponseFactory.toNextResponse(
      ResponseFactory.error(err.message, status)
    );
  }
}
