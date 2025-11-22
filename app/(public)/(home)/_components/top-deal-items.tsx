'use client';
import { ProductItemSm } from '@/app/(public)/_components/product-item-sm';
import { fetchData } from '@/funcs/fetch';
import {
  productDataResponse,
  productItemType,
} from '@/types/public.data-types';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AiFillLike } from 'react-icons/ai';
import { Loading } from '../../_components/loading';

type TopDealItemsProps = {
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
  size,
  renderSaleValue = true,
}: TopDealItemsProps) => {
  const t = useTranslations('top_deal_items');
  const [response, setResponse] = useState<productDataResponse | null>(null);

  const gridClass =
    sizeClasses[size as keyof typeof sizeClasses] || 'grid-cols-4';

  useEffect(() => {
    fetchData('/api/product', { page: 1, limit: size }, setResponse);
  }, [size]);

  const data: productItemType[] = useMemo(() => {
    return response?.data || [];
  }, [response]);

  if (!data) return <Loading />;

  return (
    <div className="w-full flex flex-col justify-start items-start gap-1 p-2 bg-background rounded-lg">
      {/* top title */}
      <div className="w-full flex flex-row justify-between items-center p-2">
        <p className="w-fit flex flex-row gap-2 text-red-600 font-bold select-none">
          <AiFillLike color="red" size={20} />
          {t('title')}
        </p>
        <Link href="#" className="text-primary hover:cursor-pointer">
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
