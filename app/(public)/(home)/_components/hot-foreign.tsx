'use client';
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

export const HotForeign = ({ size }: TopDealItemsProps) => {
  const t = useTranslations('hot_foreign');
  const [response, setResponse] = useState<productDataResponse | null>(null);
  const gridClass =
    sizeClasses[size as keyof typeof sizeClasses] || 'grid-cols-4'; // Cung cấp giá trị mặc định
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
    <div className="w-full flex flex-col justify-start items-start gap-1 p-2 bg-background-secondary rounded-lg">
      {/* top title */}
      <div className="w-full flex flex-row justify-between items-center p-2 text-base">
        <p className="w-fit flex flex-row gap-2 text-lg font-bold select-none">
          {t('title')}
        </p>
        <Link href="#" className="text-primary hover:cursor-pointer">
          {t('watch_more')}
        </Link>
      </div>
      {/* item list */}
      <div className={`w-full grid ${gridClass} gap-3 p-2 overflow-x-auto`}>
        {data.map((item: productItemType, index) => (
          <div key={index}>
            <ProductItem item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};
