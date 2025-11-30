import { NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!user)
    return NextResponse.json({ message: 'User not found' }, { status: 404 });

  if (!user.emailForBill || !user.phone || !session.user.name) {
    return NextResponse.json(
      {
        error: 'MISSING_PROFILE',
        message: 'Please update your profile information first.',
      },
      { status: 403 }
    );
  }

  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: session.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeAccount: account.id },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/seller/onboarding`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/seller/dashboard`,
      type: 'account_onboarding',
    });

    return NextResponse.json(
      { id: account.id, url: accountLink.url },
      { status: 200 }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error occurred';
    console.error('Stripe onboarding error:', message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
