'use client';
import { Loading } from '@/app/(public)/_components/loading';
import { buttonVariants } from '@/components/ui/button';
import { fetchData } from '@/funcs/fetch';
import {
  productDataResponse,
  productItemType,
} from '@/types/public.data-types';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ProductItem } from '../../../_components/product-item';

export const SuggestDealToday = () => {
  const t = useTranslations('suggest_deal_today');
  const [response, setResponse] = useState<productDataResponse | null>(null);

  useEffect(() => {
    fetchData({
      baseUrl: '/api/product',
      params: { page: 1, limit: 4 },
      setData: setResponse,
    });
  }, []);

  const data: productItemType[] = useMemo(() => {
    return response?.data || [];
  }, [response]);

  if (!data) return <Loading />;
  return (
    <div className="w-full flex flex-col justify-center items-center gap-2 bg-background rounded-lg mt-5 p-6">
      {/* top-title */}
      <p className="w-full text-left font-bold">{t('title')}</p>
      {/* content here */}
      <div className="grid grid-cols-4 gap-2 w-full">
        {data.map((item, index) => (
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
