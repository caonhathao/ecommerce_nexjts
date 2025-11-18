'use client';
import { buttonVariants } from '@/components/ui/button';
import { productItemType } from '@/types/public.data-types';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProductItem } from '../../_components/product-item';

type TopDealItemsProps = {
  data: productItemType[];
  size: string;
};

export const SuggestDealToday = ({ data, size }: TopDealItemsProps) => {
  const t = useTranslations('suggest_deal_today');
  return (
    <div className="w-full flex flex-col justify-center items-center gap-2 bg-[var(--background)] rounded-lg mt-5 p-2">
      {/* top-title */}
      <p className="w-full p-2 text-lg text-left font-bold">{t('title')}</p>
      {/* content here */}
      <div
        className={`w-full grid grid-cols-${size} gap-3 p-2 overflow-x-auto`}
      >
        {data.map((item: productItemType, index) => (
          <div key={index} className="w-full">
            <ProductItem item={item} size={'5'} />
          </div>
        ))}
      </div>
      {/* watch more */}
      <div className="w-full flex justify-center items-center">
        <Link
          href={'#'}
          className={buttonVariants({
            variant: 'outline',
            className: 'text-[var(--primary)]',
          })}
        >
          {t('watch_more')}
        </Link>
      </div>
    </div>
  );
};
