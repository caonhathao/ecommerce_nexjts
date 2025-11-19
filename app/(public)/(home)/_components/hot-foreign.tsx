'use client';
import { productItemType } from '@/types/public.data-types';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProductItem } from '../../_components/product-item';

type TopDealItemsProps = {
  size: string;
  data: productItemType[];
};

const sizeClasses = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-2',
  '3': 'grid-cols-3',
  '4': 'grid-cols-4',
  '5': 'grid-cols-5',
  '6': 'grid-cols-6',
};

export const HotForeign = ({ data, size }: TopDealItemsProps) => {
  const t = useTranslations('hot_foreign');
  const gridClass =
    sizeClasses[size as keyof typeof sizeClasses] || 'grid-cols-4'; // Cung cấp giá trị mặc định

  return (
    <div className="w-full flex flex-col justify-start items-start gap-1 p-2 mt-5 bg-[var(--background)] rounded-lg">
      {/* top title */}
      <div className="w-full flex flex-row justify-between items-center p-2 text-base">
        <p className="w-fit flex flex-row gap-2 text-lg font-bold select-none">
          {t('title')}
        </p>
        <Link href="#" className="text-[var(--primary)] hover:cursor-pointer">
          {t('watch_more')}
        </Link>
      </div>
      {/* item list */}
      <div className={`w-full grid ${gridClass} gap-3 p-2 overflow-x-auto`}>
        {data.map((item: productItemType, index) => (
          <div key={index}>
            <ProductItem item={item} size={'5'} />
          </div>
        ))}
      </div>
    </div>
  );
};
