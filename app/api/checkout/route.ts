import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Stripe } from 'stripe';
import { createOrder } from '@/app/actions/order';
import { prisma } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { draftId } = await req.json();
    const origin = process.env.NEXT_PUBLIC_BASE_URL!;

    const result = await createOrder(draftId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const order = result.order;
    const totalAmount = order.reduce(
      (acc, item) => acc + Number(item.grandTotal),
      0
    );
    const orderIds = order.map(o => o.id).join(",");
    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        orderId: orderIds,
      },
      line_items: [
        {
          price_data: {
            currency: 'vnd',
            product_data: {
              name: `Thanh toán ${order.length} đơn hàng`,
            },
            unit_amount: Math.round(totalAmount),
          },
          quantity: 1,
        },
      ],
    });

    const payment = await prisma.payment.create({
      data: {
        provider: 'STRIPE',
        method: 'CARD',
        amount: totalAmount,
        status: 'PENDING',
        currency: 'VND',
        externalId: session.id,
        rawPayload: session as any,
      },
    });
    if(!payment) {
      throw new Error('Failed to create payment record');
    }

    await prisma.orderPayment.createMany({
      data: order.map(order => ({
        orderId: order.id,
        paymentId: payment.id,
      })),
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating Stripe session:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
