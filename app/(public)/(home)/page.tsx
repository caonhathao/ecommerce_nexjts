'use client';

import { CarouselPanel } from '@/app/(public)/(home)/_components/carousel-panel';
import { CategoryPromotionPanel } from '@/app/(public)/(home)/_components/category-promotion-panel';
import banner1 from '../../../public/banners/banner-home-2.png';
import banner2 from '../../../public/banners/banner-home-1.png';
import Banner from '../_components/banner';
import { NewArrivals } from './_components/new-arrivals';
import { SuggestDealToday } from './_components/suggest-deal-today';
import { TopDealItems } from './_components/top-deal-items';
export default function Home() {
  return (
    <div className="w-full h-full flex flex-col justify-start items-center gap-4">
      <CarouselPanel />
      <CategoryPromotionPanel />
      <Banner banner={banner2} />
      <TopDealItems size={'5'} />
      <NewArrivals size={'5'} />
      <Banner banner={banner1} />
      <SuggestDealToday size="5" />
    </div>
  );
}
