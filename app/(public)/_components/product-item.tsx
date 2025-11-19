import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { productItemType } from '@/types/public.data-types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatPrice } from './global-function';
import { RatingStars } from './rating-starts';

interface ProductItemProps {
  item: productItemType;
  size: string;
  renderSaleValue?: boolean;
}

export const ProductItem = ({
  item,
  size,
  renderSaleValue = true,
}: ProductItemProps) => {
  const router = useRouter();
  const handleOpenDetail = (id: string) => {
    router.push(`/products/${id}`);
  };
  const renderSaleInfo = ({
    voucher,
  }: {
    voucher: { type: string; value: number; maxDiscount: number } | null;
  }) => {
    //console.log(voucher);
    const originalPrice = (
      <span className="text-[var(--muted-foreground)] line-through text-xs">
        {formatPrice(item.minPrice)}
      </span>
    );

    if (!voucher) {
      return (
        <div className="flex items-center gap-2">
          <p className="font-medium">{formatPrice(item.minPrice)}</p>
        </div>
      );
    } else if (voucher) {
      const discountedPrice =
        voucher.type === 'PERCENT'
          ? item.minPrice - (item.minPrice * Number(voucher.value)) / 100
          : item.minPrice - Number(voucher.value);

      const promotionBadge =
        voucher.type === 'PERCENT' ? (
          <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-[2px] rounded-md">
            -{voucher.value}%
          </span>
        ) : (
          <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-[2px] rounded-md">
            -{formatPrice(Number(voucher.value))}
          </span>
        );

      return (
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-col justify-start items-start gap-0.5">
            <div className="text-[var(--destructive)] font-medium text-[16px]">
              {Number(discountedPrice) <= 0 ? (
                <div className="flex flex-row  gap-1">
                  0<div className="underline">{'đ'}</div>
                </div>
              ) : (
                formatPrice(discountedPrice)
              )}
            </div>
            <div>{originalPrice}</div>
          </div>
          {promotionBadge}
        </div>
      );
    }
  };

  return (
    <div
      key={item.id}
      className={`w-full flex flex-col justify-start items-start flex-1 border border-gray-200 rounded-lg hover:cursor-pointer`}
      onClick={() => handleOpenDetail(item.id)}
    >
      <div className="relative w-full flex-shrink-0 aspect-square overflow-hidden rounded-t-lg">
        <Image
          src={item.imageUrl}
          alt="thumbnail"
          fill
          className="object-cover"
        />
      </div>
      <Card className="w-full max-w-sm shadow-none border-none rounded-t-none flex-shrink-0 py-2">
        <CardHeader className="px-2">
          <CardTitle className="overflow-hidden">
            <p className="text-base font-normal line-clamp-2">{item.title}</p>
          </CardTitle>
          <CardDescription>
            <div className="w-full">
              <p className="line-clamp-2 text-sm mb-1">
                Mô tả sản phẩm là 1 con vịt xòe ra 2 cái cánh nó kêu là quắc
                quắc quắc quặc qucặ
              </p>
            </div>
            <RatingStars value={item.ratingAvg} size={15} />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-start items-start px-2">
          {/*{renderSalePrice(item.voucher.type, item.voucher.value)}*/}
          {/*{renderPromotionType(item.voucher.type)}*/}
          {renderSaleInfo({ voucher: item.voucher })}
        </CardContent>
        <CardFooter className="flex-col flex justify-center items-start px-2 py-1">
          <Separator />
          <p className="w-full p-2 text-[var(--muted-foreground)] text-xs line-clamp-1 whitespace-nowrap overflow-x-hidden overflow-ellipsis">
            Made in {item.origin}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
