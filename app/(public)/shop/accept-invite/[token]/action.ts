'use server';

import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ResponseFactory } from '@/lib/api-response';
import { paths } from '@/lib/path';
import { redirect } from 'next/navigation';
import { upgradeToSeller } from '@/app/actions/role';
import { HttpStatus } from '@/types/api';

export async function acceptShopInvitation(token: string) {
  const session = await getSessionUser();

  if (!session) {
    return ResponseFactory.error({
      message: 'Unauthorized',
      code: HttpStatus.UNAUTHORIZED,
    });
  }

  const invitation = await prisma.shopInvitation.findUnique({
    where: { token },
  });

  if (!invitation || invitation.expiresAt < new Date()) {
    return ResponseFactory.error({
      message: 'This invitation is invalid or has expired.',
      code: HttpStatus.BAD_REQUEST,
    });
  }

  if (session.user.email !== invitation.email) {
    return ResponseFactory.error({
      message: `This invitation belongs to ${invitation.email}, but you are logged in as ${session.user.email}.`,
      code: HttpStatus.FORBIDDEN,
    });
  }

  const existingMember = await prisma.shopMember.findFirst({
    where: {
      shopId: invitation.shopId,
      userId: session.user.id,
    },
  });

  if (existingMember) {
    // If already a member, just cleanup and redirect
    await prisma.shopInvitation.delete({ where: { token } }).catch(() => null);
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
    return ResponseFactory.handleError(error);
  }

  // Redirect after successful transaction
  redirect(paths.seller.shops.dashboard);
}
