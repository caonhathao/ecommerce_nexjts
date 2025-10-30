'use client';

import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useSignOut() {
  const router = useRouter();

  return async function () {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
          toast.success('Signed out Successfully');
          router.refresh()
        },
        onError: () => {
          toast.error('Failed to sign out');
        },
      },
    });
  };
}
