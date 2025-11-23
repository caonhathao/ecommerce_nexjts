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

        await Promise.all(
          orderIds.map(async (oId) => {
            try {
              const orderDetails = await prisma.order.findUnique({
                where: { id: oId },
                include: { items: {} },
              });

              if (!orderDetails || !orderDetails.shopId) {
                console.warn(
                  `Skipping transfer: Shop/Order not found for order ${oId}`
                );
                return;
              }

              const seller = await prisma.shop.findUnique({
                where: { id: orderDetails.shopId },
                include: { owner: true },
              });

              if (!seller || !seller.owner || !seller.owner.stripeAccount) {
                console.warn(
                  `Skipping transfer: Seller info missing for shop ${orderDetails.shopId}`
                );
                return;
              }
              if (!seller.owner.stripeAccount.startsWith('acct_')) {
                console.log(
                  `[FAKER DATA DETECTED] Skipping transfer for Order ${oId}. Fake Stripe ID: ${seller.owner.stripeAccount}`
                );
                return;
              }

              const grandTotal = Number(orderDetails.grandTotal);
              let amountForStripe;
              if (orderDetails.currency === 'USD') {
                amountForStripe = Math.round(grandTotal * 100);
              } else {
                amountForStripe = Math.round(grandTotal);
              }

              const PLATFORM_FEE_PERCENT = 0.1;
              const amountForShop = Math.round(
                amountForStripe * (1 - PLATFORM_FEE_PERCENT)
              );
              const chargeId = session.payment_intent as string;

              try {
                await stripe.transfers.create({
                  amount: amountForShop,
                  currency: orderDetails.currency.toLowerCase() as string,
                  destination: seller.owner.stripeAccount,
                  transfer_group: orderDetails.orderNumber,
                  source_transaction: chargeId,
                });
                console.log(
                  `💰 Transferred ${amountForShop} to ${seller.owner.stripeAccount} for Order ${orderDetails.orderNumber}`
                );
              } catch (stripeError: any) {
                console.error(
                  `❌ Stripe Transfer Failed for Order ${oId}:`,
                  stripeError.message
                );
              }
            } catch (innerError) {
              console.error(
                `Error processing order ${oId} in webhook:`,
                innerError
              );
            }
          })
        );
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          const orderIds = orderId.split(',');
          await prisma.payment.updateMany({
            where: { externalId: session.id, provider: 'STRIPE' },
            data: { status: 'FAILED', updatedAt: new Date() },
          });
          await prisma.order.updateMany({
            where: { id: { in: orderIds } },
            data: { paymentStatus: 'FAILED', updatedAt: new Date() },
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    console.error('❌ Webhook Verify/Parse Error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
