'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { IconLoader2, IconBuildingStore } from '@tabler/icons-react';
import { acceptShopInvitation } from '../action';
import { useSignOut } from '@/hooks/use-signout';
import { paths } from '@/lib/path';

interface Props {
  token: string;
  shopName: string;
  invitationEmail: string;
  userEmail: string;
  userImage?: string | null;
  userName?: string | null;
}

export function AcceptInviteCard({
  token,
  shopName,
  invitationEmail,
  userEmail,
  userImage,
  userName,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const signOut = useSignOut();

  const isEmailMismatch = invitationEmail !== userEmail;

  const handleAccept = () => {
    startTransition(async () => {
      const result = await acceptShopInvitation(token);

      if (!result.success) {
        toast.error(result.message);
      }
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
          <IconBuildingStore className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">You&apos;re Invited!</CardTitle>
        <CardDescription>
          You have been invited to join the team at <strong>{shopName}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
          <Avatar>
            <AvatarImage src={userImage || ''} />
            <AvatarFallback>{userName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              Logged in as {userName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {userEmail}
            </p>
          </div>
        </div>

        {isEmailMismatch && (
          <div className="p-3 text-sm bg-warning/50 border border-warning/40 text-warning-foreground rounded-md">
            ⚠️ <strong>Warning:</strong> This invitation was sent to{' '}
            <span className="font-mono">{invitationEmail}</span>, but you are
            logged in as <span className="font-mono">{userEmail}</span>.
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {isEmailMismatch ? (
          <Button variant="destructive" className="w-full" disabled>
            Cannot Accept (Wrong Email)
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={handleAccept}
            disabled={isPending}
          >
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            Join Team
          </Button>
        )}

        {isEmailMismatch && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              signOut(
                `${paths.login}?callbackUrl=${encodeURIComponent(
                  paths.shop.accept_invite(token)
                )}`
              )
            }
          >
            Sign Out and Log in with Correct Account
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
