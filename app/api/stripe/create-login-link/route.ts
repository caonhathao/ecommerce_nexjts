import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { Stripe } from 'stripe';
import { prisma } from '@/lib/db'; // Hàm lấy session của bạn

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    const session = await getSessionUser();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeAccount: true },
    });

    if (!user || !user.stripeAccount) {
      return NextResponse.json(
        { error: 'Chưa có tài khoản thanh toán' },
        { status: 400 }
      );
    }

    const loginLink = await stripe.accounts.createLoginLink(user.stripeAccount);

    return NextResponse.json({ url: loginLink.url });
  } catch (error) {
    console.error('Lỗi tạo login link:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
  }
}
