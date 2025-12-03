'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

export const PaymentClient = ({ draftId }: { draftId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('checkout_page.payment_client');

  console.log('payment: ' + draftId);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('t_payemnt_session_failed'));
      }

      if (data.url) {
        toast.success(t('t_payment_direct'), {
          position: 'top-right',
          duration: 3000,
        });
        window.location.href = data.url; // 👉 Redirect sang Stripe Checkout
      }
    } catch (err) {
      toast.error(t('t_payment_create_session_failed'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className="bg-primary text-primary-foreground cursor-pointer px-4 py-2 rounded-lg w-full"
    >
      {isLoading ? t('t_processing') : t('t_payment')}
    </Button>
  );
};
