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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader, Lock, Mail, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export function RegisterFormTab() {
  const t = useTranslations('auth_login_page.register_form_tab');
  const registerSchema = z
    .object({
      name: z
        .string()
        .min(2, t('t_name_min_schema'))
        .max(50, t('t_name_max_schema'))
        .regex(/^[a-zA-Z\s]+$/, t('t_name_regex_chema')),
      email: z.email(t('t_email_schema')),
      password: z
        .string()
        .min(8, t('t_password_min_schema'))
        .max(100, t('t_password_max_schema'))
        .regex(/[A-Z]/, t('t_password_regex_U_schema'))
        .regex(/[a-z]/, t('t_password_regex_l_schema'))
        .regex(/[0-9]/, t('t_password_regex_n_schema'))
        .regex(/[^A-Za-z0-9]/, t('t_password_regex_spe_schema')),
      confirmPassword: z.string().min(8, t('t_password_match_failed')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { error: signUpError } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        fetchOptions: {
          onError: (ctx) => {
            toast.error(t('t_register_error'));
            console.error('Error registering user:', ctx);
          },
        },
      });

      if (signUpError) {
        toast.error(signUpError.message || t('t_register_error'));
        return;
      }

      const { error: otpError } = await authClient.emailOtp.sendVerificationOtp(
        {
          email: values.email,
          type: 'email-verification',
          fetchOptions: {
            onSuccess: () => {
              toast.success(t('t_verify_otp'), {
                description: t('t_verify_otp_desc'),
              });
            },
            onError: (ctx) => {
              toast.error(t('t_verification_error'));
              console.error('Error sending verification code:', ctx);
            },
          },
        }
      );

      if (otpError) {
        toast.error(otpError.message || t('t_verification_error'));
        return;
      }

      const callbackUrl = searchParams.get('callbackUrl') || '/';
      router.push(
        `/auth/verify-request?email=${encodeURIComponent(values.email)}&type=email-verification&callbackUrl=${encodeURIComponent(callbackUrl)}`
      );
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t('t_create')}</CardTitle>
        <CardDescription>{t('t_desc')}</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('t_full_name')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="John Doe"
                        className="pl-10"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('t_email_label')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('t_password')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    {t('t_password_desc')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('t_password_match')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  {t('t_registering')}
                </>
              ) : (
                t('t_register_action')
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
