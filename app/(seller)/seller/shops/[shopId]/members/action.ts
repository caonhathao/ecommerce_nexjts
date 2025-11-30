import { requireSeller } from '@/lib/require-role';
import { prisma } from '@/lib/db';
import { randomBytes } from 'node:crypto';
import { ShopMemberRole } from '@/lib/generated/prisma';
import { env } from '@/lib/env';
import { paths } from '@/lib/path';
import { sendShopInvitationEmail } from '@/lib/mailer';
import { InviteMemberSchema } from '@/app/(seller)/seller/shops/[shopId]/members/schema';

export async function inviteMember(
  email: string,
  shopId: string,
  role?: string
) {
  const result = InviteMemberSchema.safeParse({ email, shopId, role });

  const session = await requireSeller();
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

  const invitationLink = `${env.NEXT_PUBLIC_BASE_URL}/${paths.shop.accept_invite(token)}?email=${encodeURIComponent(email)}`;
  await sendShopInvitationEmail(
    email,
    shop.name,
    session.user.name || session.user.email || 'Shop Owner',
    invitationLink
  );

  return { success: true, message: 'Invitation sent successfully' };
}
