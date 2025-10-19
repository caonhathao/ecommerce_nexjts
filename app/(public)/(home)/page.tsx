"use client";

import { CarouselPanel } from "@/app/(public)/(home)/_components/carousel-panel";
import { CategoryPromotionPanel } from "@/app/(public)/(home)/_components/category-promotion-panel";
import { HotForeign } from "@/app/(public)/(home)/_components/hot-foreign";
import { SuggestDealToday } from "@/app/(public)/(home)/_components/suggest-deal-today";
import { TopDealItems } from "@/app/(public)/(home)/_components/top-deal-items";

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
