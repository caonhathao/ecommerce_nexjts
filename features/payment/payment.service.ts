import { CreatePaymentInput } from '@/features/payment/payment.dto';
import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';
import { ServiceError } from '@/lib/service-error';
import { Decimal } from '@prisma/client/runtime/library';

export const createPaymentService = async (params: CreatePaymentInput) => {
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

export const createPaymentIntentService = async (params: {
  vnpTxnRef: string;
  payload: Prisma.InputJsonValue;
  expiresAt: Date;
}) => {
  return prisma.paymentIntent.create({
    data: {
      vnpTxnRef: params.vnpTxnRef,
      payload: params.payload,
      expiresAt: params.expiresAt,
    },
  });
};

export const getPaymentIntentByTxnRefService = async (vnpTxnRef: string) => {
  return prisma.paymentIntent.findUnique({
    where: { vnpTxnRef },
  });
};
