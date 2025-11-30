'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { IconPlus, IconLoader2 } from '@tabler/icons-react';
import { inviteMember } from '@/app/(seller)/seller/shops/[shopId]/members/action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const inviteSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address.' }),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function InviteMemberDialog({ shopId }: { shopId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  const onSubmit = async (data: InviteFormValues) => {
    try {
      const result = await inviteMember({
        email: data.email,
        shopId,
      });

      if (result.success) {
        toast.success('Invitation sent successfully!');
        handleOpenChange(false);
        router.refresh();
      } else {
        form.setError('root', {
          message: result.message || 'Something went wrong',
        });

        toast.error('Error sending invitation. Please try again later.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again later.');
      console.error('Invite Member Error:', error);
    }
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IconPlus className="size-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Staff</DialogTitle>
          <DialogDescription>
            Send an email invitation to add a new member to this shop.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="colleague@example.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="text-red-500 text-sm">
                {form.formState.errors.root.message}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
