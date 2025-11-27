'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLoader } from '@/components/ui/loader';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader, Send, Lock, Mail } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type LoginMethod = 'password' | 'otp';

export function LoginFormTab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [githubPending, startGithubTransition] = useTransition();
  const [emailPending, startEmailTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();

  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function signInWithGithub() {
    startGithubTransition(async () => {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/',
        fetchOptions: {
          onSuccess: () => {
            toast.success('Signed in with Github, you will be redirected...');
          },
          onError: (error) => {
            toast.error('Internal Server Error');
            console.error('Error signing in with Github:', error);
          },
        },
      });
    });
  }

  function signInWithEmailOTP() {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    startEmailTransition(async () => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: email,
        type: 'sign-in',
        fetchOptions: {
          onSuccess: () => {
            toast.success('Verification code sent to your email!');
            router.push(
              `/auth/verify-request?email=${encodeURIComponent(email)}&type=sign-in&callbackUrl=${encodeURIComponent(pathname + '?' + searchParams.toString())}`
            );
          },
          onError: (e) => {
            console.error(e);
            toast.error('Error sending verification code');
          },
        },
      });

      if (error) {
        toast.error(error.message || 'Error sending verification code');
      }
    });
  }

  function signInWithPassword() {
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    startPasswordTransition(async () => {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        fetchOptions: {
          onSuccess: () => {
            toast.success('Signed in successfully!');
          },
          onError: (ctx) => {
            console.error('Sign in error:', ctx);
            toast.error('Invalid email or password');
          },
        },
      });

      if (error) {
        toast.error(error.message || 'Invalid email or password');
        return;
      }

      if (data) {
        const callbackUrl = searchParams.get('callbackUrl') || '/';
        router.push(callbackUrl);
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome back!</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
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
              Sign in with Github
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        {/* Email Login Methods */}
        <Tabs
          value={loginMethod}
          onValueChange={(value) => setLoginMethod(value as LoginMethod)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="otp">Email OTP</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          {/* OTP Login */}
          <TabsContent value="otp" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email-otp">Email</Label>
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
              <p className="text-xs text-muted-foreground">
                We&apos;ll send you a 6-digit code to sign in
              </p>
            </div>

            <Button
              onClick={signInWithEmailOTP}
              disabled={emailPending}
              className="w-full cursor-pointer"
            >
              {emailPending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Sending code...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Verification Code
                </>
              )}
            </Button>
          </TabsContent>

          {/* Password Login */}
          <TabsContent value="password" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email-password">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email-password"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
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
                <Label htmlFor="password">Password</Label>
                <Button
                  variant="link"
                  className="px-0 text-xs text-muted-foreground hover:text-primary"
                  onClick={() => {
                    toast.info('Password reset feature coming soon!');
                  }}
                >
                  Forgot password?
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
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Sign in with Password
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
