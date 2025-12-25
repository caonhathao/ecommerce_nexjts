import { DbClient } from '@/types/api';

export const getPaymentId = async (db: DbClient, orderId: string) => {
  return db.orderPayment.findUnique({
    where: { id: orderId },
    select: {
      paymentId: true,
    },
  });
};
