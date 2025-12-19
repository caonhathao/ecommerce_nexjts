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
import { AiFillLike } from 'react-icons/ai';
import { Loading } from '../../../../components/loading';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ProductItem } from '../../components/product-item';

type TopDealItemsProps = {
  size: string;
  limitItem?: number;
  showDesc?: boolean;
  showRating?: boolean;
  showFooter?: boolean;
};

const basisClasses = {
  '1': 'lg:basis-full',
  '2': 'lg:basis-1/2',
  '3': 'lg:basis-1/3',
  '4': 'lg:basis-1/4',
  '5': 'lg:basis-1/5',
  '6': 'lg:basis-1/6',
};

export const TopDealItems = ({
  size,
  limitItem = 15,
  showDesc,
  showRating,
  showFooter,
}: TopDealItemsProps) => {
  const t = useTranslations('home_layout.top_deal_items');
  const [response, setResponse] = useState<productDataResponse | null>(null);

  const basisClass =
    basisClasses[size as keyof typeof basisClasses] || 'lg:basis-1/4';

  useEffect(() => {
    fetchData({
      baseUrl: '/api/product',
      params: { page: 1, limit: limitItem, type: 'deal' },
      setData: setResponse,
    });
  }, [size, limitItem]);

  const data: productItemType[] = useMemo(() => {
    return response?.data || [];
  }, [response]);

  if (!data) return <Loading />;

  return (
    <div className="w-full flex flex-col justify-start items-start gap-1 p-2 bg-background-secondary rounded-lg">
      {/* top title */}
      <div className="w-full flex flex-row justify-between items-center p-2 mb-2">
        <p className="w-fit flex flex-row gap-2 text-error font-bold select-none items-center">
          <AiFillLike color="red" size={20} />
          {t('title')}
        </p>
        <Link href="/search" className="text-primary hover:cursor-pointer">
          {t('watch_more')}
        </Link>
      </div>

      {/* item list */}
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
              // Mobile: 2 items, Tablet: 3 items, Desktop: based on 'size' prop
              className={`pl-2 md:pl-4 basis-1/2 md:basis-1/3 ${basisClass}`}
            >
              <div className="h-full">
                <ProductItem
                  item={item}
                  showDesc={showDesc}
                  showRating={showRating}
                  showFooter={showFooter}
                />
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
