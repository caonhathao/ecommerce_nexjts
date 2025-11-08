import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Stripe } from 'stripe';
import { createOrder } from '@/app/actions/order';
import { prisma } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { draftId } = await req.json();
    const headersList = await headers();
    const origin =
      headersList.get('origin') || process.env.NEXT_PUBLIC_BASE_URL;

    const result = await createOrder(draftId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const order = result.order;

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      metadata: {
        orderId: order.id,
      },
      line_items: [
        {
          price_data: {
            currency: 'vnd',
            product_data: {
              name: 'Thanh toán đơn hàng #' + order.orderNumber,
            },
            unit_amount: Math.round(order.grandTotal.toNumber()),
          },
          quantity: 1,
        },
      ],
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "STRIPE",
        method: "CARD",
        amount: order.grandTotal,
        status: 'PENDING',
        currency: 'VND',
        externalId: session.id,
        rawPayload: session as any,       }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating Stripe session:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
