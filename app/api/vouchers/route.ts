import { prisma } from '@/lib/db';
import { ActionResponse } from '@/lib/service-response';

export const GET = async () => {
  try {
    const percentVoucher = await prisma.voucher.findMany({
      where: {
        type: 'PERCENT',
      },
      orderBy: {
        value: 'asc',
      },
      take: 20,
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
      },
    });

    const shippingVoucher = await prisma.voucher.findMany({
      where: {
        type: 'SHIPPING',
      },
      orderBy: {
        value: 'asc',
      },
      take: 20,
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
      },
    });

    const combinedVouchers = [...percentVoucher, ...shippingVoucher];
    return ActionResponse.toNextResponse(
      ActionResponse.success(combinedVouchers, 'successful', 200)
    );
  } catch (err) {
    return ActionResponse.toNextResponse(
      ActionResponse.error('Failed when get voucher', 404, {
        errorDetail: [String(err)],
      })
    );
  }
};
