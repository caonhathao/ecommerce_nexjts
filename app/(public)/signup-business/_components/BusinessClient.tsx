'use client';

import { useState } from 'react';
import { Loader2, Store, DollarSign, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { delay } from 'effect/Micro';
import { UserProfileResponseDTO } from '@/types/dtos/user.dto';

interface BusinessClientProps {
  user: UserProfileResponseDTO | null;
}

export default function BusinessClient({ user }: BusinessClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const route = useRouter();
  const handleSellerRegister = async () => {
    setIsLoading(true);
    try {
      if (user == null) return;
      if (user.emailForBill || user.phone || user.name) {
        toast.warning('Please fill in your user information to continue.', {
          duration: 3000,
          position: 'top-right',
        });
        await delay(3000);
        route.push('/customer/account/edit');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/stripe/create-connect-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(`Có lỗi xảy ra, vui lòng thử lại. ${data.error}`, {
          duration: 3000,
          position: 'top-right',
        });
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-darker flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-card rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary p-8 text-center text-primary-foreground">
          <div className="mx-auto bg-primary/80 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Store size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Trở thành Đối tác bán hàng
          </h1>
          <p className="text-primary-foreground/80">
            Tiếp cận hàng triệu khách hàng và phát triển doanh nghiệp của bạn
            cùng chúng tôi.
          </p>
        </div>

        <div className="p-8 grid md:grid-cols-3 gap-6 text-center border-b border-border">
          <div className="p-4">
            <div className="mx-auto w-10 h-10 bg-success/20 text-success rounded-full flex items-center justify-center mb-3">
              <DollarSign size={20} />
            </div>
            <h3 className="font-semibold text-foreground">Thu nhập hấp dẫn</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Phí sàn cạnh tranh, thanh toán minh bạch.
            </p>
          </div>
          <div className="p-4">
            <div className="mx-auto w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-3">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-semibold text-foreground">
              Thanh toán an toàn
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Bảo mật tuyệt đối qua nền tảng Stripe.
            </p>
          </div>
          <div className="p-4">
            <div className="mx-auto w-10 h-10 bg-warning/20 text-warning rounded-full flex items-center justify-center mb-3">
              <Store size={20} />
            </div>
            <h3 className="font-semibold text-foreground">Quản lý dễ dàng</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Dashboard chuyên nghiệp để theo dõi đơn hàng.
            </p>
          </div>
        </div>

        <div className="p-8 flex flex-col items-center">
          <p className="text-muted-foreground mb-6 text-center">
            Bạn đã sẵn sàng để bắt đầu kinh doanh? Nhấn nút bên dưới để thiết
            lập tài khoản thanh toán ngay.
          </p>

          <button
            onClick={handleSellerRegister}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 hover:cursor-pointer text-primary-foreground font-bold py-4 px-8 rounded-full shadow-lg transform transition hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" /> Đang xử lý...
              </>
            ) : (
              'Đăng ký để bán hàng ở đây'
            )}
          </button>

          <p className="text-xs text-muted-foreground mt-4">
            Bằng việc đăng ký, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
}
