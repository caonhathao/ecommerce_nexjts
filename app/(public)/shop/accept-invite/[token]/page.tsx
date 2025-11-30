import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { paths } from '@/lib/path';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IconAlertTriangle } from '@tabler/icons-react';
import { AcceptInviteCard } from '@/app/(public)/shop/accept-invite/[token]/_components/accept-card';

interface AcceptInvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function AcceptInvitePage({
  params,
}: AcceptInvitePageProps) {
  const { token } = await params;
  const session = await getSessionUser();

  const invitation = await prisma.shopInvitation.findUnique({
    where: { token },
    include: { shop: true },
  });

  if (!invitation || invitation.expiresAt < new Date()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="bg-error/35 p-4 rounded-full mb-4">
          <IconAlertTriangle className="h-8 w-8 text-error" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Invitation Expired</h1>
        <p className="text-muted-foreground mb-6">
          This invitation link is invalid or has expired. Please ask the shop
          owner to send a new one.
        </p>
        <Link href={paths.home}>
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <div className="bg-card p-8 rounded-xl shadow-md max-w-md w-full text-center space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              You&apos;ve been invited!
            </h1>
            <p className="text-text-secondary mt-2">
              Join <strong>{invitation.shop.name}</strong> on our platform.
            </p>
          </div>

          <div className="bg-info/15 p-4 rounded-lg text-sm text-info-foreground">
            Please log in to accept this invitation.
          </div>

            <Link
              href={`${paths.login}?callbackUrl=${encodeURIComponent(
                `${paths.shop.accept_invite(token)}`
              )}`}
              className="block w-full"
            >
              <Button className="w-full" size="lg">
                Log in or Create Account
              </Button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <AcceptInviteCard
        token={token}
        shopName={invitation.shop.name}
        invitationEmail={invitation.email}
        userEmail={session.user.email}
        userName={session.user.name}
        userImage={session.user.image}
      />
    </div>
  );
}
