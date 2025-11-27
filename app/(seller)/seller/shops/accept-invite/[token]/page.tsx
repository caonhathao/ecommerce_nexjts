import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface AcceptInvitePageProps {
  token: string;
}

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<AcceptInvitePageProps>;
}) {
  const { token } = await params;
  const session = await getSessionUser();

  const invitation = await prisma.shopInvitation.findUnique({
    where: { token: token },
    include: { shop: true },
  });

  if (!invitation || invitation.expiresAt < new Date()) {
    return <div>This invitation is invalid or expired.</div>;
  }

  
}
