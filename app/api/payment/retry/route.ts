// import { NextRequest } from 'next/server';
// import { Stripe } from 'stripe';
// import { getCurrentUserId } from '@/lib/auth';
// import { ActionResponse } from '@/lib/service-response';
// import { prisma } from '@/lib/db';
//
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
//
// export async function POST(req: NextRequest) {
//   try {
//     const userId = await getCurrentUserId();
//     if (!userId) {
//       return ActionResponse.toNextResponse(
//         ActionResponse.error('Unauthorized', 401)
//       );
//     }
//
//     const { orderId } = await req.json();
//
//     if (!orderId) {
//       return ActionResponse.toNextResponse(
//         ActionResponse.error('Order ID required', 400)
//       );
//     }
//
//     const order = await prisma.order.findUnique({
//       where: { id: orderId },
//       include: {
//         items: true,
//       },
//     });
//
//     if (!order) {
//       return ActionResponse.toNextResponse(
//         ActionResponse.error('order not found', 404)
//       );
//     }
//
//     if (order.paymentStatus === 'PAID') {
//       return ActionResponse.toNextResponse(
//         ActionResponse.error('Order already paid', 400)
//       );
//     }
//   } catch (error) {}
// }
