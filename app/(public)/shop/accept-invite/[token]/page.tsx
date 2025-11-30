import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { paths } from '@/lib/path';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1>You are invited to join {invitation.shop.name} shop</h1>
        <p>Please log in or create an account to accept.</p>
        <Link
          href={`${paths.login}?callbackUrl=${encodeURIComponent(paths.shop.accept_invite(token))}`}
        >
          <Button>Log in or create an account</Button>
        </Link>
      </div>
    );
  }
}
