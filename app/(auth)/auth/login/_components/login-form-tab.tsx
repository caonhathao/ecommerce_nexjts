'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLoader } from '@/components/ui/loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authClient } from '@/lib/auth-client';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { Info, Loader, Lock, Mail, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

export function LoginFormTab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const emailParam = searchParams.get('email') || '';

  const [githubPending, startGithubTransition] = useTransition();
  const [emailPending, startEmailTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();
  const [resetPasswordPending, startResetPasswordTransition] = useTransition();

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const t = useTranslations('auth_login_page.login_form_tab');
  const tApi = useTranslations('api.auth_login_page.login_form_tab');

  async function signInWithGithub() {
    startGithubTransition(async () => {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: callbackUrl,
        fetchOptions: {
          onSuccess: () => {
            toast.success(t('t_github_success'));
          },
          onError: (error) => {
            toast.error(t('t_server_error'));
            console.error('Error signing in with Github:', error);
          },
        },
      });
    });
  }

  function signInWithEmailOTP() {
    console.log(`sending OTP to ${email}...`);
    if (!email) {
      toast.error(t('t_email_failed_noti'));
      return;
    }

    startEmailTransition(async () => {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
        fetchOptions: {
          onSuccess: () => {
            toast.success(t('t_sending_verification'), {
              description: t('t_otp_desc', { email }),
            });
            router.push(
              `/auth/verify-request?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(pathname + '?' + searchParams.toString())}`
            );
          },
          onError: (ctx) => {
            console.error('Error sending OTP:', ctx);
            toast.error(t('t_server_error'));
          },
        },
      });

      if (error) {
        if (error.status === 429) {
          toast.error(t('t_too_many_requests'));
          return;
        }
      }
    });
  }

  function signInWithPassword() {
    if (!email || !password) {
      toast.error(t('t_password_missing'));
      return;
    }

    startPasswordTransition(async () => {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
        fetchOptions: {
          onSuccess: () => {
            toast.success(t('t_pasword_success'));
          },
          onError: (ctx) => {
            console.error('Sign in error:', ctx);
            toast.error(t('t_password_failed'));
          },
        },
      });

      if (error) {
        return;
      }

      if (data) {
        const callbackUrl = searchParams.get('callbackUrl') || '/';
        router.push(callbackUrl);
        router.refresh();
      }
    });
  }

  async function sendPasswordResetEmail() {
    if (!email) {
      toast.error(t('t_reset_email_missing'));
      return;
    }

    startResetPasswordTransition(async () => {
      try {
        const { error } = await authClient.requestPasswordReset({
          email,
          redirectTo: '/auth/reset-password',
          fetchOptions: {
            onError: (ctx) => {
              console.error('Reset password error:', ctx?.error);
            },
          },
        });

        if (error) {
          toast.error(error.message || t('t_reset_failed'));
          return;
        }

        toast.success(t('t_reset_sent'), {
          description: t('t_reset_sent_desc'),
        });
      } catch (err) {
        console.error('Failed to send reset email:', err);
        toast.error(t('t_reset_failed'));
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t('t_welcome')}</CardTitle>
        <CardDescription>{t('t_desc')}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* GitHub Sign In */}
        <Button
          disabled={githubPending}
          onClick={signInWithGithub}
          className="w-full cursor-pointer"
          variant="outline"
        >
          {githubPending ? (
            <AppLoader />
          ) : (
            <>
              <SiGithub color="currentColor" className="mr-2 size-5" />
              {t('t_with_github')}
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            {t('t_or')}
          </span>
        </div>

        {/* Email Login Methods */}
        <Tabs defaultValue="otp" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="otp">Email OTP</TabsTrigger>
            <TabsTrigger value="password">{t('t_password')}</TabsTrigger>
          </TabsList>

          {/* OTP Login */}
          <TabsContent value="otp" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email-otp">{t('t_email_label')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email-otp"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  disabled={emailPending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      signInWithEmailOTP();
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{t('t_otp_desc')}</p>
              <div className="flex items-start gap-2 rounded-md border border-muted p-2">
                <Info className="mt-0.5 w-4 h-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {t('t_no_register_note')}
                </p>
              </div>
            </div>

            <Button
              onClick={signInWithEmailOTP}
              disabled={emailPending}
              className="w-full cursor-pointer"
            >
              {emailPending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  {t('t_sending_code')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('t_send_code')}
                </>
              )}
            </Button>
          </TabsContent>

          {/* Password Login */}
          <TabsContent value="password" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email-password">{t('t_email_label')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email-password"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder={t('t_email_placeholder')}
                  className="pl-10"
                  disabled={passwordPending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      signInWithPassword();
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('t_password')}</Label>
                <Button
                  variant="link"
                  className="px-0 text-xs text-muted-foreground hover:text-primary"
                  disabled={resetPasswordPending}
                  onClick={sendPasswordResetEmail}
                >
                  {t('t_forgot_password')}
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  disabled={passwordPending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      signInWithPassword();
                    }
                  }}
                />
              </div>
            </div>

            <Button
              onClick={signInWithPassword}
              disabled={passwordPending}
              className="w-full cursor-pointer"
            >
              {passwordPending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  {t('t_signing')}
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  {t('t_sign_in_with_password')}
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
