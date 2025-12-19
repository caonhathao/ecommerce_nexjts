'use client';

import { RatingStars } from '@/app/(public)/_components/rating-starts';
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
import { fetchData } from '@/funcs/fetch';
import { paths } from '@/lib/path';
import { reviewDataResponse } from '@/types/public.data-types';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react'; // Import hooks
import { FaEye, FaWindowClose } from 'react-icons/fa';
import { ReviewsClient } from './reviews-client';

interface props {
  ratingAvg: number;
  ratingCount: number;
  id: string;
}

// 2. Remove 'async' keyword
export function ReviewsServer({ id, ratingAvg, ratingCount }: props) {
  const [initialResponse, setInitialResponse] =
    useState<reviewDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [next, setNext] = useState<number>(1);
  const [openList, setOpenList] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('');
  const t = useTranslations('product_detail.detail_review');

  // 3. Fetch data inside useEffect instead of 'await'
  useEffect(() => {
    const loadReviews = async () => {
      try {
        await fetchData({
          baseUrl: paths.reviews.fetch_all,
          params: { id: id, page: next, limit: 5, filterBy: filter },
          setData: setInitialResponse,
        });
      } catch (error) {
        console.error(error);
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
            className="hover:cursor-pointer"
            onClick={() => setOpenList(false)}
          >
            <FaWindowClose size={30} />
          </Button>
        </div>
        <div className="text-primary text-lg">
          Ảnh chụp sản phẩm từ khách hàng
        </div>
        {/* Wrapper này ngăn chặn sự kiện click xuyên qua. 
          Để khi click vào nút Next/Prev hoặc ảnh thì không bị đóng modal */}
        <Carousel className="w-full max-w-xs">
          <CarouselContent>
            {list.map((value, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="bg-transparent border-none shadow-none">
                    {' '}
                    {/* Bỏ viền card cho đẹp */}
                    <CardContent className="flex aspect-square items-center justify-center p-0">
                      <Image
                        src={value.url}
                        width={1000}
                        height={1000}
                        alt="image-review"
                        className="rounded-lg object-contain w-full h-full" // object-contain để thấy toàn bộ ảnh
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
        {/* summary and iamges list*/}
        <p className="font-medium text-lg p-2">{t('t_customer_review')}</p>
        <div className="w-full h-60 flex flex-row justify-start items-center p-2">
          {/* show summary first on the left */}
          <div className="w-[35%] h-60 flex flex-col justify-start items-start p-2 gap-3">
            <p className="font-medium">{t('t_summary')}</p>
            {/* show total rating and reviews that product have */}
            <div className="flex flex-col justify-center items-start">
              {/* show total rating */}
              <div className="flex flex-row justify-start items-center gap-4">
                <p className="font-semibold text-3xl">{ratingAvg}</p>
                <RatingStars value={ratingAvg} size={20} />
              </div>
              {/* show quantity of reviews */}
              <div>
                {'('}
                {ratingCount} {t('c_reviews')}
                {')'}
              </div>
            </div>
            <ul className="w-full">
              {[5, 4, 3, 2, 1].map((star) => {
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
          {/* show list of images on the right */}
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
                    className="rounded-lg object-cover"
                  />
                ))}
              {initialResponse.data.summary.allImages.length < 10 ? (
                <Button
                  variant={'outline'}
                  className="w-full h-full bg-muted-foreground/60 hover:cursor-pointer hover:bg-primary/40"
                  onClick={() => setOpenList(true)}
                >
                  <FaEye />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
        <Separator />
        {/* detail */}
        <div>
          <div className="py-2">
            <p className="font-semibold">{t('t_filter_by')}</p>
            <ul className="flex flex-row justify-start items-start gap-2 py-2 flex-wrap">
              <li
                className="p-2 border border-muted-foreground rounded-full hover:cursor-pointer text-nowrap"
                onClick={() => setFilter('newest')}
              >
                {t('c_newest')}
              </li>
              <li
                className="p-2 border border-muted-foreground rounded-full hover:cursor-pointer text-nowrap"
                onClick={() => setFilter('photo')}
              >
                {t('c_have_img')}
              </li>
              <li
                className="p-2 border border-muted-foreground rounded-full hover:cursor-pointer text-nowrap"
                onClick={() => setFilter('#')}
              >
                {t('c_buy_again')}
              </li>
              <li
                className="p-2 border border-muted-foreground rounded-full hover:cursor-pointer text-nowrap"
                onClick={() => setFilter('5')}
              >
                {t('c_5_stars')}
              </li>
              <li
                className="p-2 border border-muted-foreground rounded-full hover:cursor-pointer text-nowrap"
                onClick={() => setFilter('4')}
              >
                {t('c_4_stars')}
              </li>
              <li
                className="p-2 border border-muted-foreground rounded-full hover:cursor-pointer text-nowrap"
                onClick={() => setFilter('3')}
              >
                {t('c_3_stars')}
              </li>
              <li
                className="p-2 border border-muted-foreground rounded-full hover:cursor-pointer text-nowrap"
                onClick={() => setFilter('2')}
              >
                {t('c_2_stars')}
              </li>
              <li
                className="p-2 border border-muted-foreground rounded-full hover:cursor-pointer text-nowrap"
                onClick={() => setFilter('1')}
              >
                {t('c_1_star')}
              </li>
            </ul>
          </div>
        </div>
        <Separator />
        {/* show reviews */}
        <div className="flex flex-col justify-start items-start gap-2 py-2">
          <ReviewsClient initialResponse={initialResponse} />
        </div>
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
