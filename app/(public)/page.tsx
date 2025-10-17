"use client";

import { CarouselPanel } from "@/app/(public)/_components/home/carousel-panel";
import { CategoryPromotionPanel } from "@/app/(public)/_components/home/category-promotion-panel";
import { HotForeign } from "@/app/(public)/_components/home/hot-foreign";
import { SuggestDealToday } from "@/app/(public)/_components/home/suggest-deal-today";
import { TopDealItems } from "@/app/(public)/_components/home/top-deal-items";

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
