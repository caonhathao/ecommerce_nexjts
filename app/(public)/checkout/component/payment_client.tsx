'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { createOrder } from '@/app/actions/order';
import { Button } from '@/components/ui/button';

export const PaymentClient = ({ draftId }: { draftId: string }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
        throw new Error(data.error || 'Không thể tạo phiên thanh toán');
      }

      if (data.url) {
        toast.success('Đang chuyển đến cổng thanh toán Stripe...');
        window.location.href = data.url; // 👉 Redirect sang Stripe Checkout
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tạo phiên thanh toán');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
    >
      {isLoading ? 'Đang xử lý...' : 'Thanh toán '}
    </Button>
  );
};
