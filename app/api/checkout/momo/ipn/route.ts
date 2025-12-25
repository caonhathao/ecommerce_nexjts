import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { customerPaidOrderSuccessUsecase } from '@/features/payment_transaction/payment_transaction.usecases';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderType,
      amount,
      partnerCode,
      orderId,
      extraData,
      signature,
      transId,
      responseTime,
      resultCode,
      message,
      payType,
      requestId,
      orderInfo,
    } = body;

    const secretKey = process.env.MOMO_SECRET_KEY!;
    const accessKey = process.env.MOMO_ACCESS_KEY!;

    const rawSignature =
      'accessKey=' +
      accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&message=' +
      message +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&partnerCode=' +
      partnerCode +
      '&payType=' +
      payType +
      '&requestId=' +
      requestId +
      '&responseTime=' +
      responseTime +
      '&resultCode=' +
      resultCode +
      '&transId=' +
      transId;

    const signKey = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signKey !== signature) {
      console.error('[MOMO IPN] Invalid Signature', { orderId });
      return new NextResponse(null, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        externalId: orderId,
        provider: 'MOMO',
      },
      include: {
        orders: {
          include: {
            order: true,
          },
        },
      },
    });

    if (!payment) {
      console.error('[MOMO IPN] Payment not found', { orderId });
      return new NextResponse(null, { status: 400 });
    }

    const orderDetails = payment.orders.map((op) => op.order);
    const orderIds = orderDetails.map((o) => o.id);

    if (resultCode === 0 || resultCode === 9000) {
      console.log(`[MOMO IPN] Success Order: ${orderId}`);

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'PAID', updatedAt: new Date() },
        });

        // B. Update Order Status
        await tx.order.updateMany({
          where: { id: { in: orderIds } },
          data: {
            paymentStatus: 'PAID',
            status: 'PROCESSING',
            updatedAt: new Date(),
          },
        });

        await tx.paymentIntent.update({
          where: { gatewayRef: orderId },
          data: {
            status: 'SUCCEEDED',
          },
        });

        for (const order of orderDetails) {
          try {
            await customerPaidOrderSuccessUsecase(
              order.shopId!,
              order.grandTotal,
              order.id,
              payment.id
            );
          } catch (e) {
            console.error(`Lỗi cộng tiền ví cho order ${order}:`, e);
          }
        }
      });
    } else {
      console.log(`[MOMO IPN] Failed Order: ${orderId} - Msg: ${message}`);

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED', updatedAt: new Date() },
        });
        await tx.order.updateMany({
          where: { id: { in: orderIds } },
          data: { paymentStatus: 'FAILED', updatedAt: new Date() },
        });

        await tx.paymentIntent.update({
          where: { gatewayRef: orderId },
          data: {
            status: 'FAILED',
          },
        });
      });
    }
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('[MOMO IPN] Error:', error);
    return new NextResponse(null, { status: 500 });
  }
}
