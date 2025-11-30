'use server';

import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { randomBytes } from 'node:crypto';
import { ShopMemberRole } from '@/lib/generated/prisma';
import { env } from '@/lib/env';
import { sendShopInvitationEmail } from '@/lib/mailer';
import { paths } from '@/lib/path';
import { requireSeller } from '@/lib/require-role';

export async function acceptShopInvitation(token: string) {
  const session = await getSessionUser();

  if (!session) {
    throw new Error('Unauthorized');
  }
  const invitation = await prisma.shopInvitation.findFirst({
    where: { token },
  });

  if (!invitation || invitation.expiresAt < new Date()) {
    throw new Error('Invalid or expired invitation');
  }
}
