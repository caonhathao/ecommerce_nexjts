'use client';
import { buttonVariants } from '@/components/ui/button';
import { fetchData } from '@/funcs/fetch';
import {
  productDataResponse,
  productItemType,
} from '@/types/public.data-types';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Loading } from '../../_components/loading';
import { ProductItem } from '../../_components/product-item';

type TopDealItemsProps = {
  size: string;
};

const sizeClasses = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-2',
  '3': 'grid-cols-3',
  '4': 'grid-cols-4',
  '5': 'grid-cols-5',
  '6': 'grid-cols-6',
};

export const SuggestDealToday = ({ size }: TopDealItemsProps) => {
  const t = useTranslations('suggest_deal_today');
  const [response, setResponse] = useState<productDataResponse | null>(null);

  const gridClass =
    sizeClasses[size as keyof typeof sizeClasses] || 'grid-cols-4';

  useEffect(() => {
    fetchData({
      baseUrl: '/api/product',
      params: { page: 1, limit: size },
      setData: setResponse,
    });
  }, [size]);

  const data: productItemType[] = useMemo(() => {
    return response?.data || [];
  }, [response]);

  if (!data) return <Loading />;
  return (
    <div className="w-full flex flex-col justify-center items-center gap-2 bg-background-secondary rounded-lg mt-5 p-2">
      {/* top-title */}
      <p className="w-full p-2 text-lg text-left font-bold">{t('title')}</p>
      {/* content here */}
      <div className={`w-full grid ${gridClass} gap-3 p-2 overflow-x-auto`}>
        {data.map((item: productItemType, index) => (
          <div key={index} className="w-full">
            <ProductItem item={item} />
          </div>
        ))}
      </div>
      {/* watch more */}
      <div className="w-full flex justify-center items-center">
        <Link
          href={'#'}
          className={buttonVariants({
            variant: 'outline',
            className: 'text-primary',
          })}
        >
          {t('watch_more')}
        </Link>
      </div>
    </div>
  );
};
