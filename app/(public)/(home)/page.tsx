'use client';

import { CarouselPanel } from '@/app/(public)/(home)/_components/carousel-panel';
import { CategoryPromotionPanel } from '@/app/(public)/(home)/_components/category-promotion-panel';
import { NewArrivals } from './_components/new-arrivals';
import { SuggestDealToday } from './_components/suggest-deal-today';
import { TopDealItems } from './_components/top-deal-items';

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col justify-start items-center gap-4">
      <CarouselPanel />
      <CategoryPromotionPanel />
      <TopDealItems size={'5'} />
      <NewArrivals size={'5'} />
      <SuggestDealToday size="5" />
    </div>
  );
}
