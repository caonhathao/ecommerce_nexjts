'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { authClient } from '@/lib/auth-client';
import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';

export default function VerifyRequest() {
  const router = useRouter();
  const params = useSearchParams();
  const emailParam = params.get('email');
  const callbackParam = params.get('callbackUrl') || '/';

  const [otp, setOtp] = useState('');
  const [emailPending, startEmailTransition] = useTransition();

  const isOtpCompleted = otp.trim().length === 6;
  const email = emailParam || '';

    function verifyOtp() {
      if (!email) {
        toast.error('Email is missing.');
        return;
      }
      if (!isOtpCompleted) {
        toast.error('Please enter the 6-digit code.');
        return;
      }

      startEmailTransition(async () => {
        try {
          const { data, error } = await authClient.signIn.emailOtp({
            email,
            otp,
            fetchOptions: {
              onSuccess: () => {
                toast.success('Email verified');
              },
              onError: (err) => {
                console.error(err);
                toast.error('Error verifying email/OTP');
              },
            },
          });

          if (!error) {
            router.replace(callbackParam);
          }
        } catch (err) {
          console.error('Unexpected error during OTP verification:', err);
          toast.error('Unexpected error. Please try again.');
        }
      });
    }

    return (
        <Card className="w-full mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Please check your email</CardTitle>
                <CardDescription>
                    We have sent a verification email code to your email adress. Please open the email and
                    paste the code below.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-2">
                    <InputOTP
                        value={otp}
                        onChange={(value) => setOtp(value)}
                        maxLength={6}
                        className="gap-2 flex"
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                    <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to your email</p>
                </div>

                <Button onClick={verifyOtp} disabled={emailPending || !isOtpCompleted} className="w-full">
                    {emailPending ? (
                        <>
                            <Loader className="size-4 animate-spin" />
                            <span>Loading...</span>
                        </>
                    ) : (
                        <>
                            <p>Verify Request</p>
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
