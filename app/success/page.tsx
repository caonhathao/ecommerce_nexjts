'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();
  const delay = 3000; // 3 giây

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/customer/account/orders');
    }, delay);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-green-600">
        ✅ Thanh toán thành công!
      </h1>
      <p>Cảm ơn bạn đã mua hàng.</p>
      <p>Bạn sẽ được chuyển hướng sau {delay / 1000} giây...</p>
    </div>
  );
}
