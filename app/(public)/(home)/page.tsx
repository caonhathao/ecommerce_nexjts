'use client';

import { CarouselPanel } from '@/app/(public)/(home)/_components/carousel-panel';
import { CategoryPromotionPanel } from '@/app/(public)/(home)/_components/category-promotion-panel';
import { fetchProducts } from '@/funcs/fetch';
import { productItemType } from '@/types/public.data-types';
import React, { useEffect } from 'react';
import { Loading } from '../_components/loading';
import { HotForeign } from './_components/hot-foreign';
import { SuggestDealToday } from './_components/suggest-deal-today';
import { TopDealItems } from './_components/top-deal-items';

export default function Home() {
  const [data1, setData1] = React.useState<productItemType[]>([]);

  useEffect(() => {
    fetchProducts(1, 5, setData1);
  }, []);

  useEffect(() => {
    console.log('Fetched Products:', data1);
  }, []);

  if (data1.length < 1) {
    return <Loading />;
  }

  return (
    <div className="w-full h-full flex flex-col justify-start items-center">
      <CarouselPanel />
      <CategoryPromotionPanel />
      <TopDealItems data={data1} size="1/5" />
      <HotForeign data={data1} />
      <SuggestDealToday data={data1} />
    </div>
  );
}
