'use client';

import { CarouselPanel } from '@/app/(public)/(home)/_components/carousel-panel';
import { CategoryPromotionPanel } from '@/app/(public)/(home)/_components/category-promotion-panel';
import { fetchData } from '@/funcs/fetch';
import {
  productDataResponse,
  productItemType,
} from '@/types/public.data-types';
import React, { useEffect, useMemo } from 'react';
import { Loading } from '../_components/loading';
import { HotForeign } from './_components/hot-foreign';
import { SuggestDealToday } from './_components/suggest-deal-today';
import { TopDealItems } from './_components/top-deal-items';

export default function Home() {
  const [response, setResponse] = React.useState<productDataResponse | null>(
    null
  );

  useEffect(() => {
    fetchData({
      baseUrl: '/api/product',
      params: { page: 1, limit: 10 },
      setData: setResponse,
    });
  }, []);

  const data1: productItemType[] = useMemo(() => {
    // Return empty array if undefined
    return response?.data || [];
  }, [response]);

  useEffect(() => {
    console.log('Fetched Products:', data1);
  }, [data1]);

  if (!data1 || data1.length < 1) {
    return <Loading />;
  }

  return (
    <div className="w-full h-full flex flex-col justify-start items-center">
      <CarouselPanel />
      <div className="w-full bg-transparent p-1.5"></div>
      <CategoryPromotionPanel />
      <div className="w-full bg-transparent p-1.5"></div>
      <TopDealItems data={data1} size={'5'} />
      <HotForeign data={data1} size={'5'} />
      <SuggestDealToday data={data1} size="5" />
    </div>
  );
}
