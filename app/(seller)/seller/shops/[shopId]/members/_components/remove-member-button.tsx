'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { IconLoader2, IconTrash } from '@tabler/icons-react';
import { removeMember } from '@/app/(seller)/seller/shops/[shopId]/members/action';

interface Props {
  shopId: string;
  memberId: string;
  memberName: string;
}

export function RemoveMemberButton({ shopId, memberId, memberName }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    if (!confirm(`Are you sure you want to remove ${memberName}?`)) return;

    startTransition(async () => {
      const result = await removeMember(shopId, memberId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRemove}
      disabled={isPending}
      className="text-red-500 hover:text-red-600 hover:bg-red-50"
    >
      {isPending ? (
        <IconLoader2 className="h-4 w-4 animate-spin" />
      ) : (
        <IconTrash className="h-4 w-4 mr-1" />
      )}
      Remove
    </Button>
  );
}
