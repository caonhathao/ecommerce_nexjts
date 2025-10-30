import { auth } from '@/lib/auth';
import { LoginForm } from './_components/LoginForm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

type Props = {
  searchParams?: { callbackUrl?: string } | Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (session?.user) {
    const params = await searchParams;
    const to = params?.callbackUrl ?? '/';
    redirect(to);
  }

  return <LoginForm />;
}