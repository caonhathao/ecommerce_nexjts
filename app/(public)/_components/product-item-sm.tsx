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

export const ProductItemSm = ({
                              item,
                              size,
                              renderSaleValue = true,
                            }: ProductItemProps) => {
  const router = useRouter();
  const handleOpenDetail = (id: string) => {
    router.push(`/products/${id}`);
  };
  const renderSaleInfo = (type: string | null, value: number | null) => {
    const originalPrice = (
      <span className="text-[var(--muted-foreground)] line-through text-xs">
        {formatPrice(item.minPrice)}đ
      </span>
    );

    if (!type || value === null || !renderSaleValue) {
      return (
        <div className="flex items-start">
          <span className="font-normal">{formatPrice(item.minPrice)}đ</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-start">
        <div className="flex flex-row items-start">
          {originalPrice}
        </div>
      </div>
    );
  };

  return (
    <div
      key={item.id}
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
      <Card className="w-full gap-2 p-0 max-w-sm shadow-none border-none rounded-t-none flex-shrink-0">
        <CardHeader className="p-2">
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
            <RatingStars value={item.ratingAvg} size={10}/>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-start items-start px-2 py-1">
          {renderSaleInfo(item.voucher.type, item.voucher.value)}
        </CardContent>
      </Card>
    </div>
  );
};
