// import { InputJsonValue } from '@prisma/client/runtime/library';
import InputJsonValue = Prisma.InputJsonValue;
import { $Enums, Prisma } from '@/lib/generated/prisma';
import { DbClient } from '@/types/api';
import PaymentProvider = $Enums.PaymentProvider;
import { prisma } from '@/lib/db';
import IntentStatus = $Enums.IntentStatus;

export const createPaymentIntentService = async (
  db: DbClient,
  params: {
    gatewayRef: string;
    provider: PaymentProvider;
    status: IntentStatus;
    orderIds: InputJsonValue;
    amount: Prisma.Decimal;
    expiresAt: Date;
  }
) => {
  return db.paymentIntent.create({
    data: {
      gatewayRef: params.gatewayRef,
      provider: params.provider,
      status: params.status,
      orderIds: params.orderIds,
      amount: params.amount,
      expiresAt: params.expiresAt,
    },
  });
};

export const getPaymentIntentByTxnRefService = async (gatewayRef: string) => {
  return prisma.paymentIntent.findUnique({
    where: { gatewayRef },
  });
};

export const getActiveIntent = async (
  db: DbClient,
  params: {
    provider: PaymentProvider;
    status: IntentStatus;
    orderIds: string[];
  }
) => {
  return db.paymentIntent.findFirst({
    where: {
      provider: params.provider,
      status: params.status,
      expiresAt: { gt: new Date() },
      orderIds: { array_contains: params.orderIds },
    },
    orderBy: { createdAt: 'desc' },
  });
};
