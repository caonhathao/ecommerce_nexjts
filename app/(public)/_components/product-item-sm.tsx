import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { productItemType } from '@/types/public.data-types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RatingStars } from './rating-starts';
import { formatPrice } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ProductItemProps {
  item: productItemType;
  renderSaleValue?: boolean;
}

export const ProductItemSm = ({
  item,
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
    const t = useTranslations('general');

    if (!voucher && !renderSaleValue) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {formatPrice(item.minPrice, {
              currency: t('t_currency'),
              rate: Number(t('t_rate')),
            })}
          </span>
        </div>
      );
    } else if (voucher) {
      const calculatedPrice =
        voucher.type === 'PERCENT'
          ? item.minPrice - (item.minPrice * Number(voucher.value)) / 100
          : item.minPrice - Number(voucher.value);

      // Đảm bảo giá không bao giờ âm
      const discountedPrice = Math.max(0, calculatedPrice);

      //console.log(discountedPrice);

      const promotionBadge =
        voucher.type === 'PERCENT' ? (
          <span className="bg-success/10 text-success text-xs font-medium px-2 py-0.5 rounded-md">
            -{voucher.value}%
          </span>
        ) : (
          <span className="bg-success/10 text-success text-xs font-medium px-2 py-0.5 rounded-md">
            -
            {formatPrice(Number(voucher.value), {
              currency: t('t_currency'),
              rate: Number(t('t_rate')),
            })}
          </span>
        );

      return (
        <div className="w-full flex flex-col justify-center items-end gap-1">
          <div className="flex flex-row justify-end items-center gap-2">
            <div className="text-error font-medium text-sm">
              {formatPrice(discountedPrice, {
                currency: t('t_currency'),
                rate: Number(t('t_rate')),
              })}
            </div>
            {/* {originalPrice} */}
          </div>
          {promotionBadge}
        </div>
      );
    }
  };

  return (
    <div
      key={item.id}
      className={`flex flex-col justify-start items-start flex-1 border border-border border-2 rounded-lg hover:cursor-pointer`}
      onClick={() => handleOpenDetail(item.id)}
    >
      <div className="relative w-full flex-shrink-0 aspect-square overflow-hidden rounded-t-lg">
        <Image
          src={item.imageUrl}
          alt="thumbnail"
          sizes="auto"
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
                {item.description
                  ? item.description
                  : 'Sản phẩm này là độc nhất chỉ có 1 không 2  mà giá lại rẻ hãy mua ngay hôm nay'}
              </p>
            </div>
            <RatingStars value={item.ratingAvg} size={10} />
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-start items-start px-2 py-1">
          {renderSaleInfo({ voucher: item.voucher })}
        </CardContent>
      </Card>
    </div>
  );
};
