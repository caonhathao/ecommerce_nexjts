'use server';

import { auth, getSessionUser } from '@/lib/auth';
import { Role } from '@/lib/generated/prisma';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';

export async function upgradeToSeller() {
  const session = await getSessionUser();

  if (!session) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: Role.seller },
  });

  await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
}
