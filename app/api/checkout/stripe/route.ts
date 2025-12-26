import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { createOrder } from '@/app/actions/order';
import { prisma } from '@/lib/db';
import getRedisClient from '@/lib/redis';
import { vndToUsdCents } from '@/lib/currency-helper';
import { createCheckoutRequestUseCase } from '@/features/payment/payment.usecases';
import { $Enums } from '@/lib/generated/prisma';
import PaymentProvider = $Enums.PaymentProvider;
import PaymentStatus = $Enums.PaymentStatus;
import Currency = $Enums.Currency;
import { createPaymentIntentService } from '@/features/payment/services/payment_intent.service';
import IntentStatus = $Enums.IntentStatus;
import dayjs from 'dayjs';
import { ResponseFactory } from '@/lib/api-response';
import { Decimal } from '@/lib/generated/prisma/runtime/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    //lấy đơn hàng nháp
    const { draftId } = await req.json();
    const origin = process.env.NEXT_PUBLIC_BASE_URL!;

    //tạo đơn
    const result = await createOrder(draftId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    //gọi redis lấy tỉ giá
    const client = await getRedisClient();
    const rate = await client.get('currency-rate');
    if (!rate)
      return NextResponse.json({ error: 'redis error' }, { status: 400 });

    const rateDcm = new Decimal(rate);
    const orderList = result.order;

    const metadata: Record<string, string> = {
      orderId: orderList.map((o) => o.id).join(','),
    };
    const orderIds = Array.from(orderList.map((o) => o.id));

    let totalUsdCent = 0;

    for (const order of orderList) {
      const priceUsd = vndToUsdCents(
        new Decimal(Number(order.grandTotal)),
        rateDcm
      );
      const usdCents = priceUsd.toNumber();
      totalUsdCent += usdCents;
      metadata[`_${order.id}`] = usdCents.toString();
    }

    const totalGrand = orderList.reduce(
      (total, order) => total.plus(order.grandTotal),
      new Decimal(0)
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
      metadata: metadata,
      payment_intent_data: {
        transfer_group: metadata.orderId,
        metadata: metadata,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Thanh toán ${orderList.length} đơn hàng`,
            },
            unit_amount: totalUsdCent,
          },
          quantity: 1,
        },
      ],
    });

    const expiresAt = dayjs().add(15, 'minute').toDate();
    await createPaymentIntentService(prisma, {
      gatewayRef: session.payment_intent as string,
      provider: PaymentProvider.STRIPE,
      orderIds: { orderIds: orderIds },
      status: IntentStatus.ACTIVE,
      amount: totalGrand,
      expiresAt: expiresAt,
    });

    await createCheckoutRequestUseCase(prisma, {
      params: {
        provider: PaymentProvider.STRIPE,
        method: 'CARD',
        amount: totalUsdCent,
        status: PaymentStatus.PENDING,
        currency: Currency.USD,
        externalId: session.payment_intent as string,
        rawPayload: {
          id: session.id,
          url: session.url,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          metadata: session.metadata,
        },
      },
      orderList: orderIds,
    });

    return ResponseFactory.toNextResponse(
      ResponseFactory.success({ data: { url: session.url } })
    );
  } catch (err) {
    console.error('Error creating Stripe session:', err);
    return ResponseFactory.toNextResponse(
      ResponseFactory.error({ message: 'Unknown error', code: 500 })
    );
  }
}
