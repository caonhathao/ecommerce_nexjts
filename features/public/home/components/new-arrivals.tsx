'use client';

import { fetchApi } from '@/lib/client-fetch';
import { productItemType } from '@/types/public.data-types';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Skeleton } from '@/components/ui/skeleton'; // Ensure you have this component

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ProductItem } from '../../components/product-item';

type NewArrivalsProps = {
  size: string;
};

const basisClasses = {
  '1': 'lg:basis-full',
  '2': 'lg:basis-1/2',
  '3': 'lg:basis-1/3',
  '4': 'lg:basis-1/4',
  '5': 'lg:basis-1/5',
  '6': 'lg:basis-1/6',
};

export const NewArrivals = ({ size }: NewArrivalsProps) => {
  const t = useTranslations('home_layout.new_arrivals');
  const [data, setData] = useState<productItemType[] | null>(null);

  const basisClass =
    basisClasses[size as keyof typeof basisClasses] || 'lg:basis-1/4';

  useEffect(() => {
    const loadNewArrivals = async () => {
      try {
        const res = await fetchApi<productItemType[]>('/api/product', {
          params: { page: 1, limit: 15, type: 'new' },
        });

        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (error) {
        console.error('Failed to load new arrivals:', error);
      }
    };

    loadNewArrivals();
  }, []);

  // --- SKELETON LOADING STATE ---
  if (!data) {
    return (
      <div className="w-full flex flex-col justify-start items-start gap-1 p-4 bg-background-secondary rounded-lg">
        {/* Header Skeleton */}
        <div className="w-full flex flex-row justify-between items-center p-2 mb-2">
          <Skeleton className="h-7 w-40 rounded-md" /> {/* Title */}
          <Skeleton className="h-5 w-24 rounded-md" /> {/* Watch More */}
        </div>

        {/* Carousel Items Skeleton */}
        <div className="w-full px-2 overflow-hidden">
          <div className="flex -ml-2 md:-ml-4">
            {/* Render 6 skeleton items to fill the view */}
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`pl-2 md:pl-4 basis-1/2 md:basis-1/3 ${basisClass} shrink-0`}
              >
                <div className="flex flex-col space-y-3">
                  {/* Product Image */}
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <div className="space-y-2">
                    {/* Product Title */}
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[80%]" />
                    {/* Price */}
                    <Skeleton className="h-5 w-[40%] mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- ACTUAL CONTENT ---
  return (
    <div className="w-full flex flex-col justify-start items-start gap-1 p-4 bg-background-secondary rounded-lg">
      {/* Top Title */}
      <div className="w-full flex flex-row justify-between items-center p-2 mb-2">
        <p className="w-fit flex flex-row gap-2 text-lg font-bold select-none">
          {t('title')}
        </p>
        <Link
          href="/search"
          className="text-primary hover:cursor-pointer text-sm font-medium"
        >
          {t('watch_more')}
        </Link>
      </div>

      {/* Carousel */}
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: true,
          }),
        ]}
        className="w-full px-2"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {data.map((item, index) => (
            <CarouselItem
              key={index}
              className={`pl-2 md:pl-4 basis-1/2 md:basis-1/3 ${basisClass}`}
            >
              <div className="h-full">
                <ProductItem item={item} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 -ml-2" />
        <CarouselNext className="right-0 -mr-2" />
      </Carousel>
    </div>
  );
};
