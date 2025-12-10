'use server';

import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ResponseFactory } from '@/lib/api-response';
import { paths } from '@/lib/path';
import { redirect } from 'next/navigation';
import { upgradeToSeller } from '@/app/actions/role';

export async function acceptShopInvitation(token: string) {
  const session = await getSessionUser();

  if (!session) {
    return ResponseFactory.error('Unauthorized', 401);
  }

  const invitation = await prisma.shopInvitation.findUnique({
    where: { token },
  });

  if (!invitation || invitation.expiresAt < new Date()) {
    return ResponseFactory.error(
      'This invitation is invalid or has expired.',
      400
    );
  }

  if (session.user.email !== invitation.email) {
    return ResponseFactory.error(
      `This invitation belongs to ${invitation.email}, but you are logged in as ${session.user.email}.`,
      403
    );
  }

  const existingMember = await prisma.shopMember.findFirst({
    where: {
      shopId: invitation.shopId,
      userId: session.user.id,
    },
  });

  if (existingMember) {
    await prisma.shopInvitation.delete({ where: { token } });
    redirect(paths.seller.shops.dashboard);
  }

  try {
    await prisma.$transaction([
      prisma.shopMember.create({
        data: {
          shopId: invitation.shopId,
          userId: session.user.id,
          role: invitation.role,
        },
      }),
      prisma.shopInvitation.delete({
        where: { token },
      }),
    ]);

    await upgradeToSeller();
  } catch (error) {
    console.error('Accept Invite Error:', error);
    return ResponseFactory.error('Failed to process invitation', 500);
  }

  redirect(paths.seller.shops.dashboard);
}
