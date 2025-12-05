'use client';
import { fetchData } from '@/funcs/fetch';
import {
  productDataResponse,
  productItemType,
} from '@/types/public.data-types';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Loading } from '../../../../components/loading';
import { ProductItem } from '../../_components/product-item';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

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
  const [response, setResponse] = useState<productDataResponse | null>(null);
  const basisClass =
    basisClasses[size as keyof typeof basisClasses] || 'lg:basis-1/4';

  useEffect(() => {
    fetchData({
      baseUrl: '/api/product',
      params: { page: 1, limit: 15, type: 'new' },
      setData: setResponse,
    });
  }, [size]);

  const data: productItemType[] = useMemo(() => {
    return response?.data || [];
  }, [response]);

  if (!data) return <Loading />;
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
          {data.map((item: productItemType, index) => (
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
