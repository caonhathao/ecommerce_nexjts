import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { createOrder } from '@/app/actions/order';
import { prisma } from '@/lib/db';
import { Decimal } from '@/lib/generated/prisma/runtime/library';
import getRedisClient from '@/lib/redis';
import { vndToUsdCents } from '@/lib/currency-helper';
import { createPaymentService } from '@/features/payment/payment.service';

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

    const payment = await createPaymentService({
      provider: 'STRIPE',
      method: 'CARD',
      amount: totalUsdCent,
      status: 'PENDING',
      currency: 'USD',
      externalId: session.id,
      rawPayload: {
        id: session.id,
        url: session.url,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        metadata: session.metadata,
      },
    });
    if (!payment) {
      throw new Error('Failed to create payment record');
    }

    await prisma.orderPayment.createMany({
      data: orderList.map((order) => ({
        orderId: order.id,
        paymentId: payment.id,
      })),
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('Error creating Stripe session:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}

// const totalAmount = order.reduce(
//   (acc: Decimal, item) => acc.plus(item.grandTotal),
//   new Decimal(0)
// );
//
// const usdTotal = vndToUsdCents(totalAmount, rateDcm);
// const unitAmount = usdTotal.toDecimalPlaces(0).toNumber();

// const orderIds = order.map((o) => o.id).join(',');
