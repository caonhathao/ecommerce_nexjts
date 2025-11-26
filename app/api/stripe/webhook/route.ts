import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { vndToUsdCents } from '@/lib/currency-helper';
import getRedisClient from '@/lib/redis';
import { Decimal } from '@/lib/generated/prisma/runtime/library';

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

        // 1. UPDATE STATUS (Giữ nguyên)
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

        // 2. LẤY THÔNG TIN CHARGE TỪ STRIPE (Để lấy Charge ID làm nguồn tiền)
        const paymentIntentId = session.payment_intent as string;
        const paymentIntent =
          await stripe.paymentIntents.retrieve(paymentIntentId);
        const chargeId = paymentIntent.latest_charge as string;

        // 3. PROCESS TRANSFERS
        await Promise.all(
          orderIds.map(async (oId) => {
            try {
              const orderDetails = await prisma.order.findUnique({
                where: { id: oId },
                select: { shopId: true },
              });

              if (!orderDetails?.shopId) return;

              const seller = await prisma.shop.findUnique({
                where: { id: orderDetails.shopId! },
                include: { owner: true },
              });

              if (!seller?.owner?.stripeAccount?.startsWith('acct_')) {
                console.log(`🚫 Skipping invalid seller account: ${oId}`);
                return;
              }
              const key = `_${oId}`;
              const amountString = metadata[key];

              if (!amountString) {
                console.error(
                  `❌ Không tìm thấy số tiền USD cho đơn ${oId} trong metadata`
                );
                return;
              }
              const grossAmountCents = parseInt(amountString, 10);
              const platformFee = Math.ceil(grossAmountCents * 0.1);
              const amountForShop = grossAmountCents - platformFee;

              console.log(`💵 [Order ${oId}] Transfer Info:
                - Gross (Khách trả): ${grossAmountCents} cents
                - Fee (Phí sàn) : ${platformFee} cents
                - Shop nhận: ${amountForShop} cents
              `);

              if (amountForShop <= 0) return;

              await stripe.transfers.create({
                amount: amountForShop,
                currency: 'usd',
                destination: seller.owner.stripeAccount,
                source_transaction: chargeId,
              });

              console.log(`✅ Transfer Success for Order ${oId}`);
            } catch (innerError) {
              console.error(`🔥 Error processing order ${oId}:`, innerError);
            }
          })
        );
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
