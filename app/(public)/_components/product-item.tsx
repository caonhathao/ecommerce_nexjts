import { Separator } from '@/components/ui/separator';
import { productItemType } from '@/types/public.data-types';
import { useRouter } from 'next/navigation';
import { formatPrice } from './global-function';
import { RatingStars } from './rating-starts';
import Image from 'next/image';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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

  // const renderPromotionType = (type: string | null) => {
  //   if (!renderSaleValue) return null;
  //
  //   let promotion: React.ReactNode = null;
  //
  //   if (type === 'PERCENT') {
  //     promotion = (
  //       <div className="text-chart-2 rounded-lg w-fit text-sm px-1">
  //         -{item.voucher.value}%
  //       </div>
  //     );
  //   } else if (type === 'FIXED') {
  //     promotion = (
  //       <div className="text-chart-2 w-fit text-sm px-1">
  //         -{formatPrice(Number(item.voucher.value))}
  //       </div>
  //     );
  //   }
  //
  //   return (
  //     <div className="w-full flex flex-row gap-2 justify-start items-start">
  //       {promotion}
  //       <div className="text-[var(--muted-foreground)] line-through text-tiny">
  //         {formatPrice(Number(item.minPrice))}
  //       </div>
  //     </div>
  //   );
  // };
  //
  // const renderSalePrice = (type: string | null, value: number | null) => {
  //   if (!type || value === null) {
  //     return <p className="font-medium">{formatPrice(item.minPrice)}đ</p>;
  //   }
  //
  //   const discountedPrice =
  //     type === 'PERCENT'
  //       ? item.minPrice - (item.minPrice * value) / 100
  //       : item.minPrice - value;
  //
  //   return (
  //     <p className="text-[var(--destructive)] font-medium text-sm">
  //       {formatPrice(discountedPrice)}
  //     </p>
  //   );
  // };

  const renderSaleInfo = (type: string | null, value: number | null) => {
    const originalPrice = (
      <span className="text-[var(--muted-foreground)] line-through text-xs">
        {formatPrice(item.minPrice)}đ
      </span>
    );

    if (!type || value === null || !renderSaleValue) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{formatPrice(item.minPrice)}đ</span>
        </div>
      );
    }

    const discountedPrice =
      type === 'PERCENT'
        ? item.minPrice - (item.minPrice * value) / 100
        : item.minPrice - value;

    const promotionBadge =
      type === 'PERCENT' ? (
        <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-[2px] rounded-md">
          -{value}%
        </span>
      ) : (
        <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-[2px] rounded-md">
          -{formatPrice(value)}
        </span>
      );

    return (
      <div className="flex flex-col items-start gap-2">
        <div className="flex flex-row items-center gap-2">
          <p className="text-[var(--destructive)] font-medium text-sm">
            {formatPrice(discountedPrice)}
          </p>
          {originalPrice}
        </div>
        {promotionBadge}
      </div>
    );
  };

  return (
    <div
      className={`w-${size} flex flex-col justify-start items-start flex-${size} border border-gray-200 rounded-lg hover:cursor-pointer`}
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
      <Card className="w-full max-w-sm shadow-none border-none rounded-t-none flex-shrink-0">
        <CardHeader>
          <CardTitle className="overflow-hidden">
            <p className="text-base font-normal line-clamp-1">{item.title}</p>
          </CardTitle>
          <CardDescription>
            <div className="w-full">
              <p className="line-clamp-2 text-sm mb-1">
                Mô tả sản phẩm là 1 con vịt xòe ra 2 cái cánh nó kêu là quắc
                quắc quắc quặc qucặ
              </p>
            </div>
            <RatingStars value={item.ratingAvg} />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-start items-start">
          {/*{renderSalePrice(item.voucher.type, item.voucher.value)}*/}
          {/*{renderPromotionType(item.voucher.type)}*/}
          {renderSaleInfo(item.voucher.type, item.voucher.value)}
        </CardContent>
        <CardFooter className="flex-col flex justify-center items-start">
          <Separator />
          <p className="p-2 text-[var(--muted-foreground)] text-xs">
            Made in {'VN'}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
