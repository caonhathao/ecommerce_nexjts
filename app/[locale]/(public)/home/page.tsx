"use client";

import { CarouselPanel } from "./_components/carousel-panel";
import { CategoryPromotionPanel } from "./_components/category-promotion-panel";
import { HotForeign } from "./_components/hot-foreign";
import { SuggestDealToday } from "./_components/suggest-deal-today";
import { TopDealItems } from "./_components/top-deal-items";

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col justify-start items-center">
      <CarouselPanel />
      <CategoryPromotionPanel />
      <TopDealItems />
      <HotForeign />
      <SuggestDealToday />
    </div>
  );
}
