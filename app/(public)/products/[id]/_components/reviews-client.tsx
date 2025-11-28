'use client';
import { formatDay } from '@/app/(public)/_components/global-function';
import { RatingStars } from '@/app/(public)/_components/rating-starts';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { reviewResponse, reviewsType } from '@/types/public.data-types';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo } from 'react';
import { AiOutlineLike } from 'react-icons/ai';

interface props {
  ratingAvg: number;
  ratingCount: number;
  initialResponse: reviewResponse;
}
export function ReviewsClient({
  ratingAvg,
  ratingCount,
  initialResponse,
}: props) {
  const t = useTranslations('product_detail.detail_review');
  const data: reviewsType[] = useMemo(() => {
    return initialResponse.data || null;
  }, [initialResponse]);

  const renderReview = (reviewData: reviewsType) => {
    return (
      <div className="flex flex-row justify-start items-start w-full gap-2 py-2">
        <div
          className="w-[25%] flex flex-row gap-2 justify-start items-center"
          key={reviewData.user.id}
        >
          <Image
            src={reviewData.user.image}
            alt="user-avatar"
            width={30}
            height={30}
            className="rounded-full"
          />
          <p>{reviewData.user.name}</p>
        </div>
        <div className="w-[75%] flex flex-col gap-2">
          <RatingStars value={reviewData.rating} />
          <p>{reviewData.body}</p>
          <div className="flex flex-row justify-between items-center gap-1 text-sm w-full">
            <p className="italic">
              {t('t_review_at')}
              {formatDay(reviewData.createdAt)}
            </p>
            <div className="flex flex-row justify-end items-center">
              <AiOutlineLike size={15} color="var(--primary)" />
              {reviewData.likes}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-background-secondary rounded-lg mt-3 p-3 flex flex-col justify-start items-start">
      {/* summary */}
      <div className="flex flex-col justify-start items-start py-2 gap-2">
        <p className="font-medium text-lg">{t('t_custome_review')}</p>
        <p className="font-medium">{t('t_summary')}</p>
        <div className="flex flex-row justify-start items-center gap-4">
          <RatingStars value={ratingAvg} />
          <p>
            {ratingCount} {t('c_reviews')}
          </p>
        </div>
      </div>
      <Separator />
      {/* detail */}
      <div>
        <div className="py-2">
          <p>{t('t_filter_by')}</p>
          <ul className="flex flex-row justify-start items-start gap-2 py-2">
            <li className="p-2 border border-muted-foreground rounded-xl hover:cursor-pointer">
              {t('c_newest')}
            </li>
            <li className="p-2 border border-muted-foreground rounded-xl hover:cursor-pointer">
              {t('c_have_img')}
            </li>
            <li className="p-2 border border-muted-foreground rounded-xl hover:cursor-pointer">
              {t('c_buy_again')}
            </li>
            <li className="p-2 border border-muted-foreground rounded-xl hover:cursor-pointer">
              {t('c_5_stars')}
            </li>
            <li className="p-2 border border-muted-foreground rounded-xl hover:cursor-pointer">
              {t('c_5_stars')}
            </li>
            <li className="p-2 border border-muted-foreground rounded-xl hover:cursor-pointer">
              {t('c_3_stars')}
            </li>
            <li className="p-2 border border-muted-foreground rounded-xl hover:cursor-pointer">
              {t('c_2_stars')}
            </li>
            <li className="p-2 border border-muted-foreground rounded-xl hover:cursor-pointer">
              {t('c_1_star')}
            </li>
          </ul>
        </div>
      </div>
      <Separator />
      {/* show reviews */}
      <div className="flex flex-col justify-start items-start gap-2 py-2">
        {data?.map((value, index) => (
          <div key={index} className="w-full">
            {renderReview(value)}
            <Separator />
          </div>
        ))}
      </div>
      <div className="w-full flex justify-center items-center">
        <Button variant="outline" className="text-primary hover:cursor-pointer">
          {t('t_more_action')}
        </Button>
      </div>
    </div>
  );
}
