import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.SECRET_WEBHOOK_STRIPE!;
console.log('⚡ Stripe webhook route triggered');
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = (await headers()).get('stripe-signature');

  try {
    const event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('✅ Payment success for:', session.id);

        const orderId = session.metadata?.orderId;
        const paymentIntentId = session.payment_intent as string;

        if (orderId) {
          await prisma.payment.updateMany({
            where: { orderId, provider: "STRIPE" },
            data: {
              status: 'PAID',
              externalId: paymentIntentId,
              updatedAt: new Date(),
            },
          });

          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'PAID',
              status: 'PAID',
              updatedAt: new Date(),
            },
          });
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        await prisma.payment.updateMany({
          where: { orderId, provider: 'STRIPE' },
          data: { status: 'FAILED' },
        });
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
