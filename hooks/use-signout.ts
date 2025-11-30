'use client';

import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useSignOut() {
  const router = useRouter();

  return async function (callbackUrl?: string) {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(callbackUrl || '/');
          toast.success('Signed out Successfully');
          router.refresh();
        },
        onError: () => {
          toast.error('Failed to sign out');
        },
      },
    });
  };
}
