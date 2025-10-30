'use client';
import { productItemType } from '@/types/public.data-types';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProductItem } from '../../_components/product-item';

type TopDealItemsProps = {
  data: productItemType[];
};

export const HotForeign = ({ data }: TopDealItemsProps) => {
  const t = useTranslations('hot_foreign');
  return (
    <div className="w-full flex flex-col justify-start items-start gap-1 p-2 mt-5 bg-[var(--background)] rounded-lg">
      {/* top title */}
      <div className="w-full flex flex-row justify-between items-center">
        <p className="w-fit flex flex-row gap-2 font-bold">{t('title')}</p>
        <Link href="#" className="text-[var(--primary)] hover:cursor-pointer">
          {t('watch_more')}
        </Link>
      </div>
      {/* item list */}
      <div className="w-full flex flex-row gap-2">
        {data.map((item: productItemType, index) => (
          <ProductItem item={item} size={'4'} />
        ))}
      </div>
    </div>
  );
};
