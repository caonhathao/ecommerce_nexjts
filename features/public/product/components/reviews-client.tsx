'use client';

import { Separator } from '@/components/ui/separator';
import { formatDay } from '@/lib/utils';
import { reviewDataResponse, reviewsItemType } from '@/types/public.data-types';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useMemo } from 'react';
import { AiOutlineLike } from 'react-icons/ai';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User2 } from 'lucide-react';
import { RatingStars } from '../../components/rating-starts';

interface props {
  initialResponse: reviewDataResponse;
}
export function ReviewsClient({ initialResponse }: props) {
  const t = useTranslations('product_detail.detail_review');
  const data: reviewsItemType[] = useMemo(() => {
    return initialResponse.data.reviews || null;
  }, [initialResponse]);

  const renderReview = (reviewData: reviewsItemType) => {
    return (
      <div className="flex flex-row justify-start items-start w-full gap-2 py-2">
        <div
          className="w-[25%] flex flex-row gap-2 justify-start items-center"
          key={reviewData.user.id}
        >
          <Avatar className="w-9 h-9">
            <AvatarImage
              src={reviewData.user.image}
              alt={reviewData.user.name}
            />
            <AvatarFallback>
              <User2 className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
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
    <div className="flex flex-col justify-start items-start gap-2 py-2">
      {data?.map((value, index) => (
        <div key={index} className="w-full">
          {renderReview(value)}
          <Separator />
        </div>
      ))}
    </div>
  );
}
