import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.SECRET_WEBHOOK_STRIPE!;

console.log('⚡ Stripe webhook route triggered');

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  try {
    const event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('✅ Payment success for:', session.id);

        const orderId = session.metadata?.orderId;
        if (!orderId) break;
        const orderIds = orderId.split(',');

        await prisma.payment.updateMany({
          where: { externalId: session.id, provider: 'STRIPE' },
          data: { status: 'PAID', updatedAt: new Date() },
        });

        await prisma.order.updateMany({
          where: { id: { in: orderIds } },
          data: {
            paymentStatus: 'PAID',
            status: 'PROCESSING',
            updatedAt: new Date(),
          },
        });
        console.log(
          `✅ Payment success for session ${session.id}, updated ${orderIds.length} orders`
        );
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (!orderId) break;
        console.log('⚠️ Payment expired for:', session.id);
        const orderIds = orderId.split(',');

        await prisma.payment.updateMany({
          where: { externalId: session.id, provider: 'STRIPE' },
          data: { status: 'FAILED', updatedAt: new Date() },
        });

        await prisma.order.updateMany({
          where: { id: { in: orderIds } },
          data: { paymentStatus: 'FAILED', updatedAt: new Date() },
        });

        console.log('⚠️ Payment failure for:', session.id);

        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    console.error('❌ Webhook Error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
