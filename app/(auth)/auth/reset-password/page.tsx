'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { paths } from '@/lib/path';

export default function ResetPassword() {
  const t = useTranslations('auth_login_page.reset_password_page');
  const tRegister = useTranslations('auth_login_page.register_form_tab');
  const resetPasswordSchema = z
    .object({
      password: z
        .string()
        .min(8, tRegister('t_password_min_schema'))
        .max(100, tRegister('t_password_max_schema'))
        .regex(/[A-Z]/, tRegister('t_password_regex_U_schema'))
        .regex(/[a-z]/, tRegister('t_password_regex_l_schema'))
        .regex(/[0-9]/, tRegister('t_password_regex_n_schema'))
        .regex(/[^A-Za-z0-9]/, tRegister('t_password_regex_spe_schema')),
      confirmPassword: z.string().min(8, tRegister('t_password_match_failed')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: tRegister('t_password_match_failed'),
      path: ['confirmPassword'],
    });

  type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [pending, startTransition] = useTransition();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // 3. Handle Submission
  async function onSubmit(values: ResetPasswordValues) {
    if (!token) {
      toast.error(t('t_invalid_token'));
      return;
    }

    startTransition(async () => {
      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });

      if (error) {
        toast.error(error.message || t('t_reset_failed'));
        return;
      }

      toast.success(t('t_reset_success'), {
        description: t('t_reset_success_desc'),
      });

      router.push(paths.login);
    });
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">{t('t_title')}</CardTitle>
        <CardDescription>{t('t_desc')}</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('t_new_password')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="password"
                        placeholder={t('t_password_placeholder')}
                        className="pl-10"
                        disabled={pending}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('t_confirm_password')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="password"
                        placeholder={t('t_password_placeholder')}
                        className="pl-10"
                        disabled={pending}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={pending}
              className="w-full cursor-pointer"
            >
              {pending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  {t('t_resetting')}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t('t_reset_action')}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
