'use client';
import { formatDay } from '@/app/(public)/_components/global-function';
import { RatingStars } from '@/app/(public)/_components/rating-starts';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { fetchReviews } from '@/funcs/fetch';
import { reviewsType } from '@/types/public.data-types';
import React, { useEffect } from 'react';
import { AiOutlineLike } from 'react-icons/ai';

interface props {
  ratingAvg: number;
  ratingCount: number;
  id: string;
}
const Reviews = ({ id, ratingAvg, ratingCount }: props) => {
  const [data, setData] = React.useState<reviewsType[] | null>(null);

  useEffect(() => {
    fetchReviews(setData, id);
  }, []);

  useEffect(() => {
    console.log(data);
  }, [data]);

  const renderReview = (reviewData: reviewsType) => {
    return (
      <div className="flex flex-row justify-start items-start w-full gap-2 py-2">
        <div
          className="w-[25%] flex flex-row gap-2 justify-start items-center"
          key={reviewData.user.id}
        >
          <img
            src={reviewData.user.image}
            alt="user-avatar"
            className="w-20 rounded-full"
          />
          <p>{reviewData.user.name}</p>
        </div>
        <div className="w-[75%]">
          <RatingStars value={reviewData.rating} />
          <p className="font-semibold text-lg">{reviewData.title}</p>
          <p>{reviewData.body}</p>
          <div className="flex flex-row italic gap-2 text-sm">
            <p>Đánh giá lúc: {formatDay(reviewData.createdAt)}</p>
            <p>Chỉnh sửa lúc: {formatDay(reviewData.createdAt)}</p>
          </div>
          <div className="flex flex-row justify-start items-center">
            <AiOutlineLike size={15} color="var(--primary)" />
            {reviewData.likes}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-[var(--background)] rounded-lg mt-3 p-3 flex flex-col justify-start items-start">
      {/* summary */}
      <div className="flex flex-col justify-start items-start py-2">
        <p className="font-semibold text-lg">Khách hàng đánh giá</p>
        <p className="font-semibold">Tổng quan</p>
        <div className="flex flex-row justify-start items-start">
          <RatingStars value={ratingAvg} />
          <p>{ratingCount} đánh giá</p>
        </div>
      </div>
      <Separator />
      {/* detail */}
      <div>
        <div className="py-2">
          <p>Lọc theo</p>
          <ul className="flex flex-row justify-start items-start gap-2 py-2">
            <li className="p-2 border border-[var(--muted-foreground)] rounded-full hover:cursor-pointer">
              Mới nhất
            </li>
            <li className="p-2 border border-[var(--muted-foreground)] rounded-full hover:cursor-pointer">
              Có hình ảnh
            </li>
            <li className="p-2 border border-[var(--muted-foreground)] rounded-full hover:cursor-pointer">
              Mua lại
            </li>
            <li className="p-2 border border-[var(--muted-foreground)] rounded-full hover:cursor-pointer">
              5 sao
            </li>
            <li className="p-2 border border-[var(--muted-foreground)] rounded-full hover:cursor-pointer">
              4 sao
            </li>
            <li className="p-2 border border-[var(--muted-foreground)] rounded-full hover:cursor-pointer">
              3 sao
            </li>
            <li className="p-2 border border-[var(--muted-foreground)] rounded-full hover:cursor-pointer">
              2 sao
            </li>
            <li className="p-2 border border-[var(--muted-foreground)] rounded-full hover:cursor-pointer">
              1 sao
            </li>
          </ul>
        </div>
      </div>
      <Separator />
      {/* show reviews */}
      <div className="flex flex-col justify-start items-start gap-2 py-2">
        {data?.map((value, index) => (
          <>
            {renderReview(value)}
            <Separator />
          </>
        ))}
      </div>
      <div className="w-full flex justify-center items-center">
        <Button variant="outline" className="text-[var(--primary)]">
          Xem thêm
        </Button>
      </div>
    </div>
  );
};

export default Reviews;
