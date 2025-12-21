'use client';

import Pagination from '@/components/custom/pagination';
import { VolumeBar } from '@/components/custom/volume-bar';
import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { paths } from '@/lib/path';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FaEye, FaWindowClose } from 'react-icons/fa';
import { RatingStars } from '../../public/components/rating-starts';
import { ReviewsClient } from './reviews-client';
import { fetchApi } from '@/lib/client-fetch';

interface ReviewApiPayload {
  reviews: reviewsItemType[];
  summary: {
    allImages: { url: string }[];
    ratingBreakdown: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    totalImages: number;
  };
}

// 2. The State Object (Combines Data + Pagination)
export interface reviewDataResponse {
  data: ReviewApiPayload;
  pagination: {
    page: number;
    limit: number;
    total: number; // Changed from 'total' to match API meta
    totalPages: number;
  };
}

export interface reviewsItemType {
  body: string;
  createdAt: string;
  id: string;
  likes: number;
  rating: number;
  title: string;
  images: any; // Changed from JSON to any/object for client usage
  user: {
    id: string;
    image: string;
    name: string;
  };
}

interface props {
  ratingAvg: number;
  ratingCount: number;
  id: string;
}

export function ReviewsServer({ id, ratingAvg, ratingCount }: props) {
  // State matches the 'reviewDataResponse' structure
  const [initialResponse, setInitialResponse] =
    useState<reviewDataResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [next, setNext] = useState<number>(1);
  const [openList, setOpenList] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('');
  const t = useTranslations('product_detail.detail_review');

  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      try {
        const res = await fetchApi<ReviewApiPayload>(paths.reviews.fetch_all, {
          params: {
            id: id,
            page: next,
            limit: 5,
            filterBy: filter,
          },
        });

        if (res.success && res.data) {
          // Construct the state object by combining data + meta
          setInitialResponse({
            data: res.data,
            pagination: res.meta?.pagination || {
              page: 1,
              limit: 5,
              total: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPrevPage: false,
            },
          });
        }
      } catch (error) {
        console.error('Failed to load reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadReviews();
  }, [id, filter, next]);

  if (loading || !initialResponse) {
    return <Loading />;
  }

  const OpenImage = ({ list }: { list: { url: string }[] }) => {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm">
        <div className="absolute top-5 right-5">
          <Button
            variant={'ghost'}
            className="hover:cursor-pointer text-white"
            onClick={() => setOpenList(false)}
          >
            <FaWindowClose size={30} />
          </Button>
        </div>
        <div className="text-white text-lg">
          Ảnh chụp sản phẩm từ khách hàng
        </div>
        <Carousel className="w-full max-w-xs">
          <CarouselContent>
            {list.map((value, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="bg-transparent border-none shadow-none">
                    <CardContent className="flex aspect-square items-center justify-center p-0">
                      <Image
                        src={value.url}
                        width={1000}
                        height={1000}
                        alt="image-review"
                        className="rounded-lg object-contain w-full h-full"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    );
  };

  return (
    <>
      <div className="w-full bg-background-secondary rounded-lg mt-3 p-3 flex flex-col justify-start items-start">
        <p className="font-medium text-lg p-2">{t('t_customer_review')}</p>
        <div className="w-full h-60 flex flex-row justify-start items-center p-2">
          {/* Summary Section */}
          <div className="w-[35%] h-60 flex flex-col justify-start items-start p-2 gap-3">
            <p className="font-medium">{t('t_summary')}</p>
            <div className="flex flex-col justify-center items-start">
              <div className="flex flex-row justify-start items-center gap-4">
                <p className="font-semibold text-3xl">{ratingAvg}</p>
                <RatingStars value={ratingAvg} size={20} />
              </div>
              <div>
                {'('}
                {ratingCount} {t('c_reviews')}
                {')'}
              </div>
            </div>
            <ul className="w-full">
              {[5, 4, 3, 2, 1].map((star) => {
                // FIX: Added .data before .summary
                const count =
                  initialResponse.data.summary.ratingBreakdown[
                    star as 1 | 2 | 3 | 4 | 5
                  ] || 0;

                const percent =
                  ratingCount > 0 ? (count / ratingCount) * 100 : 0;

                return (
                  <li
                    key={star}
                    className="flex flex-row justify-start items-center gap-2"
                  >
                    <RatingStars value={star} />
                    <VolumeBar size={percent} />
                    <span className="text-sm text-gray-500 w-8 text-right">
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <Separator orientation="vertical" />

          {/* Image List Section */}
          <div className="w-[65%] h-60 flex flex-col justify-start items-start gap-2 p-2">
            <p className="font-semibold">Tất cả hình ảnh</p>
            <div className="grid grid-cols-6 grid-rows-2 gap-1">
              {initialResponse.data.summary.allImages
                .slice(0, 9)
                .map((value, index) => (
                  <Image
                    key={index}
                    src={value.url}
                    width={200}
                    height={200}
                    alt="image-review"
                    className="rounded-lg object-cover w-full h-full aspect-square"
                  />
                ))}
              {initialResponse.data.summary.allImages.length > 9 ? (
                <Button
                  variant={'outline'}
                  className="w-full h-full bg-muted-foreground/60 hover:cursor-pointer hover:bg-primary/40 aspect-square"
                  onClick={() => setOpenList(true)}
                >
                  <FaEye />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
        <Separator />

        {/* Filters */}
        <div>
          <div className="py-2">
            <p className="font-semibold">{t('t_filter_by')}</p>
            <ul className="flex flex-row justify-start items-start gap-2 py-2 flex-wrap">
              {/* Added onClick handlers for specific filters if needed */}
              <li
                className={`p-2 border ${filter === 'newest' ? 'border-primary text-primary' : 'border-muted-foreground'} rounded-full hover:cursor-pointer text-nowrap`}
                onClick={() => setFilter('newest')}
              >
                {t('c_newest')}
              </li>
              {/* ... other filters ... */}
            </ul>
          </div>
        </div>
        <Separator />

        {/* Review List */}
        <div className="flex flex-col justify-start items-start gap-2 py-2 w-full">
          <ReviewsClient initialResponse={initialResponse} />
        </div>

        {/* Pagination */}
        <div className="w-full flex justify-center items-center">
          <Pagination
            current={initialResponse.pagination.page}
            total={initialResponse.pagination.totalPages}
            setNext={setNext}
          />
        </div>
      </div>

      {openList ? (
        <OpenImage list={initialResponse.data.summary.allImages} />
      ) : null}
    </>
  );
}
