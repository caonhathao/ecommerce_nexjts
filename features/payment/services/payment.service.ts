import { CreatePaymentInput } from '@/features/payment/payment.dto';
import { prisma } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';
import { DbClient } from '@/types/api';

export const createPaymentService = async (
  db: DbClient,
  params: CreatePaymentInput
) => {
  return prisma.payment.create({
    data: {
      provider: params.provider,
      method: params.method,
      amount: new Decimal(params.amount),
      status: params.status,
      currency: params.currency,
      externalId: params.externalId,
      rawPayload: params.rawPayload,
    },
  });
};
