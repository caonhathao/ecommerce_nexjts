'use client';
import { ProductItemSm } from '@/app/(public)/_components/product-item-sm';
import { productItemType } from '@/types/public.data-types';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { AiFillLike } from 'react-icons/ai';

type TopDealItemsProps = {
  data: productItemType[];
  size: string;
  renderSaleValue?: boolean;
};

const sizeClasses = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-2',
  '3': 'grid-cols-3',
  '4': 'grid-cols-4',
  '5': 'grid-cols-5',
  '6': 'grid-cols-6',
};

export const TopDealItems = ({
  data,
  size,
  renderSaleValue = true,
}: TopDealItemsProps) => {
  const t = useTranslations('top_deal_items');

  const gridClass =
    sizeClasses[size as keyof typeof sizeClasses] || 'grid-cols-4';

  return (
    <div className="w-full flex flex-col justify-start items-start gap-1 p-2 bg-[var(--background)] rounded-lg">
      {/* top title */}
      <div className="w-full flex flex-row justify-between items-center p-2">
        <p className="w-fit flex flex-row gap-2 text-[var(--destructive)] font-bold select-none">
          <AiFillLike color="var(--destructive)" size={20} />
          {t('title')}
        </p>
        <Link href="#" className="text-[var(--primary)] hover:cursor-pointer">
          {t('watch_more')}
        </Link>
      </div>
      {/* item list */}
      <div
        className={`w-full grid ${gridClass} grid-rows-1 p-2 gap-3 overflow-x-auto`}
      >
        {data.map((item: productItemType, index) => (
          <div key={index}>
            <ProductItemSm item={item} renderSaleValue={renderSaleValue} />
          </div>
        ))}
      </div>
    </div>
  );
};
