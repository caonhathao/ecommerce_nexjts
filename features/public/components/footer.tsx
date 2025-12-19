import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Facebook, Youtube, Send } from 'lucide-react';
import { FaFacebook, FaYoutube } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="bg-background border-t pt-10 pb-6 text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        {/* --- Top Section: 5 Columns --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Column 1: Customer Support */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground text-base">
              {t('customer_support')}
            </h3>
            <div className="flex flex-col gap-1">
              <p>
                {t('hotline')}:{' '}
                <span className="font-bold text-foreground">1900-6035</span>
              </p>
              <p className="text-xs">{t('hotline_rate')}</p>
            </div>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('faq')}
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('support_request')}
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('ordering_guide')}
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('shipping_methods')}
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('return_policy')}
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('installment_guide')}
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('import_policy')}
            </Link>
            <p>
              {t('support_email')}:{' '}
              <span className="text-foreground">hotro@2t3h.vn</span>
            </p>
            <p>
              {t('security_email')}:{' '}
              <span className="text-foreground">security@2t3h.vn</span>
            </p>
          </div>

          {/* Column 2: About Us */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-foreground text-base">
              {t('about_us')}
            </h3>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('about_company')}
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('blog')}
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('careers')}
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('privacy_payment')}
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('privacy_personal')}
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('complaint_settlement')}
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('terms_of_use')}
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('sell_with_us')}
            </Link>
            <Link href="#" className="hover:text-primary hover:underline">
              {t('enterprise_sales')}
            </Link>
          </div>

          {/* Column 3: Partnership & Certifications */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-foreground text-base">
                {t('partnership')}
              </h3>
              <Link href="#" className="hover:text-primary hover:underline">
                {t('operation_regulations')}
              </Link>
              <Link href="#" className="hover:text-primary hover:underline">
                {t('sell_on_platform')}
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-foreground text-base">
                {t('certifications')}
              </h3>
              <div className="flex gap-2">
                <div className="w-8 h-8 md:w-[100px] md:h-9 bg-destructive/10 rounded border border-destructive/20 flex items-center justify-center text-[10px] text-destructive font-bold">
                  BO CONG THUONG
                </div>
                <div className="w-8 h-8 md:w-[100px] md:h-9 bg-info/10 rounded border border-info/20 flex items-center justify-center text-[10px] text-info font-bold">
                  DMCA
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Payment Methods */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-foreground text-base">
              {t('payment_methods')}
            </h3>
            <div className="grid grid-cols-4">
              {[
                { name: 'Visa', src: '/payments/visa.svg' },
                { name: 'MasterCard', src: '/payments/mastercard.svg' },
                { name: 'Momo', src: '/payments/momo.png' },
                { name: 'COD', src: '/payments/cod.png' },
                { name: 'ATM', src: '/payments/atm.png' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="h-10 w-12 flex items-center justify-center hover:scale-105 transition"
                >
                  <Image
                    src={item.src}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>

            <h3 className="font-semibold text-foreground text-base mt-2">
              {t('delivery_services')}
            </h3>
            <div className="flex gap-2">
              <div className="h-6 px-2 bg-info text-white rounded text-xs flex items-center font-bold italic">
                {t('delivery_now')}
              </div>
            </div>
          </div>

          {/* Column 5: Connect & App */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground text-base">
              {t('connect')}
            </h3>
            <div className="flex gap-3">
              <a href="#" className="text-info hover:opacity-80">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-destructive hover:opacity-80">
                <FaYoutube size={24} />
              </a>
              <a
                href="#"
                className="text-info hover:opacity-80 flex items-center justify-center h-6 w-6 rounded-full border border-info font-bold text-[10px]"
              >
                Zalo
              </a>
            </div>

            <h3 className="font-semibold text-foreground text-base mt-2">
              {t('download_app')}
            </h3>
            <div className="flex gap-2 items-start">
              <div className="w-24 h-24 overflow-hidden rounded-lg border flex items-center justify-center">
                {' '}
                <Image
                  src="/footer/qrcode.png"
                  alt="QR Code"
                  width={96}
                  height={96}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Link href="#" className="block">
                  <Image
                    src="/footer/appstore.png"
                    alt="App Store"
                    width={140}
                    height={40}
                    className="object-contain hover:opacity-80 transition"
                  />
                </Link>

                <Link href="#" className="block">
                  <Image
                    src="/footer/playstore.png"
                    alt="Google Play"
                    width={140}
                    height={40}
                    className="object-contain hover:opacity-80 transition"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* --- Middle Section: Company Info --- */}
        <div className="space-y-2 mb-6">
          <h4 className="font-bold text-foreground">{t('company_name')}</h4>
          <p>
            {t('company_address')}: {t('address_full')}
          </p>
          <p>{t('business_license')}</p>
          <p>
            {t('hotline')}: <span className="text-info">1900 6035</span>
          </p>
        </div>

        <Separator className="my-6" />

        {/* --- Bottom Section: SEO / About Text --- */}
        <div className="space-y-4">
          <h4 className="font-bold text-foreground">{t('slogan')}</h4>

          <div className="space-y-2">
            <h5 className="font-semibold text-foreground">{t('has_it_all')}</h5>
            <p>{t('has_it_all_desc')}</p>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-foreground">
              {t('promotions_overflow')}
            </h5>
            <p>{t('promotions_desc')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
