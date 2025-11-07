import { auth, getSessionUser } from '@/lib/auth';
import { LoginForm } from './_components/login-form';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

type Props = {
  searchParams?: { callbackUrl?: string } | Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await getSessionUser();

  if (session?.user) {
    const params = await searchParams;
    const to = params?.callbackUrl ?? '/';
    redirect(to);
  }

  return <LoginForm />;
}