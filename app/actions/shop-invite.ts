import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { randomBytes } from 'node:crypto';
import { ShopMemberRole } from '@/lib/generated/prisma';
import { env } from '@/lib/env';
import { sendShopInvitationEmail } from '@/lib/mailer';

export async function inviteMember(email: string, shopId: string) {
  const session = await getSessionUser();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const shop = await prisma.shop.findFirst({
    where: { id: shopId, ownerId: session.user.id },
  });

  if (!shop) throw new Error('Shop not found or permission denied');

  const existingMember = await prisma.shopMember.findFirst({
    where: {
      shopId,
      user: { email },
    },
  });
  if (existingMember) throw new Error('User is already a member of this shop');

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3); // 3 days

  await prisma.shopInvitation.upsert({
    where: {
      shopId_email: { shopId, email },
    },
    update: { token, expiresAt },
    create: {
      email,
      shopId,
      token,
      expiresAt,
      role: ShopMemberRole.STAFF,
    },
  });

  const invitationLink = `${env.NEXT_PUBLIC_BASE_URL}/seller/shops/accept-invite/${token}`;
  await sendShopInvitationEmail(
    email,
    shop.name,
    session.user.name || session.user.email || 'Shop Owner',
    invitationLink
  );

  return { success: true, message: 'Invitation sent successfully' };
  
}
