import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { $Enums } from '@/lib/generated/prisma';
import IntentStatus = $Enums.IntentStatus;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.SECRET_WEBHOOK_STRIPE!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  try {
    const event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
    console.log(`🔹 [Webhook] Event verified. Type: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const metadata = session.metadata || {};

        if (!session.metadata || Object.keys(session.metadata).length === 0) {
          return NextResponse.json(
            { message: 'metadata is empty or missing' },
            { status: 400 }
          );
        }
        const orderId = session.metadata.orderId;

        if (!orderId) {
          console.error('❌ Error: orderId missing in metadata');
          break;
        }
        const orderIds = orderId.split(',');

        const payment = await prisma.payment.findFirst({
          where: {
            externalId: session.id,
            provider: 'STRIPE',
          },
          include: {
            orders: {
              include: {
                order: true,
              },
            },
          },
        });

        await prisma.$transaction(async (tx) => {
          await tx.paymentIntent.update({
            where: { gatewayRef: session.payment_intent as string },
            data: {
              status: IntentStatus.SUCCEEDED,
            },
          });

          await tx.payment.update({
            where: { id: payment!.id },
            data: { status: 'PAID', updatedAt: new Date() },
          });

          await tx.order.updateMany({
            where: { id: { in: orderIds } },
            data: {
              paymentStatus: 'PAID',
              status: 'PROCESSING',
              updatedAt: new Date(),
            },
          });
        });
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderIds = session.metadata?.orderId?.split(',');
        if (orderIds) {
          await prisma.payment.updateMany({
            where: { externalId: session.id },
            data: { status: 'FAILED' },
          });
          await prisma.order.updateMany({
            where: { id: { in: orderIds } },
            data: { paymentStatus: 'FAILED' },
          });
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    console.error('💥 Webhook Error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
