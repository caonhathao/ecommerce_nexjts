import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: '403 – Forbidden',
};

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <Card className="max-w-md w-full text-center space-y-4">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full border text-2xl font-semibold">
            403
          </div>
          <CardTitle className="text-2xl">Access denied</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You don&apos;t have permission to view this page.
            If you think this is a mistake, please contact support or try logging in with another account.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/">Back to home</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/auth/login">Go to login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
