import { prisma } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';
import { ServiceError } from '@/lib/service-error';

const toDecimal = (val: Decimal | number) => new Decimal(val);

export const customerPaidOrderSuccess = async (
  shopId: string,
  amountInput: Decimal | number,
  orderId: string,
  paymentId?: string
) => {
  const amount = toDecimal(amountInput);
  return prisma.$transaction(async (tx) => {
    const updatedBalance = await tx.shopBalance.upsert({
      where: { shopId: shopId },
      create: {
        shopId: shopId,
        pending: amount,
        available: 0,
        frozen: 0,
        version: 1,
      },
      update: {
        pending: { increment: amount },
        version: { increment: 1 },
      },
    });

    const balanceAfter = updatedBalance.pending;
    const balanceBefore = balanceAfter.minus(amount);

    await tx.ledgerEntry.create({
      data: {
        shopId: shopId,
        amount: amount,
        type: 'ORDER_PAID',
        description: `Customer payment for order #${orderId}`,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        orderId: orderId,
        paymentId,
      },
    });

    //Now + 3 days to settle
    const settleDate = new Date();
    settleDate.setDate(settleDate.getDate() + 3);

    await tx.settlementQueue.create({
      data: {
        shopId: shopId,
        orderId: orderId,
        amount: amount,
        status: 'PENDING',
        dueAt: settleDate,
      },
    });

    return updatedBalance;
  });
};

export const paySettleQueue = async () => {
  const now = new Date();
  const pendingSettlements = await prisma.settlementQueue.findMany({
    where: {
      status: 'PENDING',
      dueAt: { lte: now },
    },
    take: 100, // Process từng batch nhỏ
  });

  for (const settlement of pendingSettlements) {
    try {
      // Transaction nhỏ cho từng đơn
      await prisma.$transaction(async (tx) => {
        const checkItem = await tx.settlementQueue.findUnique({
          where: { id: settlement.id },
        });
        if (!checkItem || checkItem.status !== 'PENDING') return;

        const shopBalance = await tx.shopBalance.update({
          where: { shopId: settlement.shopId },
          data: {
            pending: { decrement: settlement.amount },
            available: { increment: settlement.amount },
            version: { increment: 1 },
          },
        });

        const balanceAfter = shopBalance.available;
        const balanceBefore = balanceAfter.minus(settlement.amount);

        await tx.ledgerEntry.create({
          data: {
            shopId: settlement.shopId,
            amount: settlement.amount,
            // Mình khuyên nên có type riêng cho việc này, ví dụ 'SETTLEMENT' thay vì 'PAYOUT'
            // PAYOUT thường dùng cho việc Shop rút tiền về ngân hàng
            type: 'PAYOUT',
            description: `Settlement (Pending -> Available) for order #${settlement.orderId}`,
            balanceBefore: balanceBefore,
            balanceAfter: balanceAfter,
            orderId: settlement.orderId,
          },
        });

        await tx.settlementQueue.update({
          where: { id: settlement.id },
          data: {
            status: 'PROCESSED',
          },
        });
      });
    } catch (error) {
      console.error(`Lỗi xử lý settlement ID ${settlement.id}:`, error);
    }
  }
};

export const shopSendWithdrawMoney = async (
  shopId: string,
  amountInput: Decimal | number
) => {
  const amount = toDecimal(amountInput);
  return prisma.$transaction(async (tx) => {
    const shopValid = await tx.shopBalance.findUnique({
      where: { shopId: shopId },
    });
    if (!shopValid) {
      throw new ServiceError('Shop does not exist', 404);
    }

    if (shopValid.available.lessThan(amount)) {
      throw new ServiceError('Insufficient funds', 400);
    }

    const updatedBalance = await tx.shopBalance.update({
      where: { shopId: shopId, version: shopValid.version },
      data: {
        available: { decrement: amount },
        frozen: { increment: amount },
        version: { increment: 1 },
      },
    });

    const balanceAfter = updatedBalance.available;
    const balanceBefore = balanceAfter.plus(amount);

    await tx.ledgerEntry.create({
      data: {
        shopId: shopId,
        amount: amount.negated(),
        balanceAfter: balanceAfter,
        balanceBefore: balanceBefore,
        type: 'PAYOUT',
        description: 'Shop with drawn money to bank',
      },
    });
    return updatedBalance;
  });
};

export const requestWithDrawMoneySuccess = async (
  shopId: string,
  amountInput: Decimal | number
) => {
  const amount = toDecimal(amountInput);
  return prisma.shopBalance.update({
    where: { shopId: shopId },
    data: {
      frozen: { decrement: amount },
      version: { increment: 1 },
    },
  });
};

export const requestWithDrawnMoneyFailed = async (
  shopId: string,
  amountInput: Decimal | number
) => {
  const amount = toDecimal(amountInput);
  return prisma.$transaction(async (tx) => {
    const updateBalance = await tx.shopBalance.update({
      where: { shopId: shopId },
      data: {
        frozen: { decrement: amount },
        available: { increment: amount },
        version: { increment: 1 },
      },
    });

    const balanceAfter = updateBalance.available;
    const balanceBefore = balanceAfter.minus(amount);

    await tx.ledgerEntry.create({
      data: {
        shopId: shopId,
        amount: amount,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        type: 'REFUND',
        description: 'Refund failed withdrawal',
      },
    });

    return updateBalance;
  });
};
