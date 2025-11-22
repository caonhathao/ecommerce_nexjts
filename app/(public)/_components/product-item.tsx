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
}

export const ProductItem = ({ item }: ProductItemProps) => {
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
      <span className="text-muted-foreground line-through text-xs">
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
          <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-0.5 rounded-md">
            -{voucher.value}%
          </span>
        ) : (
          <span className="bg-green-100 text-green-600 text-xs font-medium px-2 py-0.5 rounded-md">
            -{formatPrice(Number(voucher.value))}
          </span>
        );

      return (
        <div className="flex flex-col items-end gap-2 w-full">
          <div className="flex flex-col justify-start items-end gap-0.5">
            <div>{originalPrice}</div>

            <div className="text-red-600 font-medium text-[18px]">
              {Number(discountedPrice) <= 0 ? (
                <div className="flex flex-row  gap-1">
                  0<div className="underline">{'đ'}</div>
                </div>
              ) : (
                formatPrice(discountedPrice)
              )}
            </div>
          </div>
          {promotionBadge}
        </div>
      );
    }
  };

  return (
    <div
      key={item.id}
      className={`w-full h-full flex flex-1 bg-background border border-gray-200 rounded-lg hover:cursor-pointer`}
      onClick={() => handleOpenDetail(item.id)}
    >
      <Card className="w-full shadow-none border-none rounded-t-none flex flex-col justify-between shrink-0 p-0 rounded-lg">
        <div>
          <CardHeader className="p-0">
            <Image
              src={item.imageUrl}
              alt="thumbnail"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full aspect-square object-cover rounded-t-lg"
            />
            <CardTitle className="overflow-hidden px-2 py-1">
              <p className="text-base font-normal line-clamp-2">{item.title}</p>
            </CardTitle>
            <CardDescription className="px-2 py-1">
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
        </div>
        <CardFooter className="flex-col flex justify-center items-start px-2 py-1">
          <Separator />
          <p className="w-full p-2 text-muted-foreground text-xs line-clamp-1 whitespace-nowrap overflow-x-hidden overflow-ellipsis text-right">
            Made in {item.origin}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
