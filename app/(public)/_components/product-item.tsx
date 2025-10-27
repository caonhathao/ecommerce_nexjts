import { Separator } from '@/components/ui/separator';
import { productItemType } from '@/types/public.data-types';
import { formatPrice } from './global-function';
import { RatingStars } from './rating-starts';

interface ProductItemProps {
  item: productItemType;
}

export const ProductItem = ({ item }: ProductItemProps) => {
  const renderPromotionType = (type: string | null) => {
    if (type === null) {
      <div className="w-full flex flex-row gap-2 justify-start items-start">
        {/* origin price */}
        <div className="text-[var(--muted-foreground)] line-through text-xs">
          {formatPrice(Number(item.minPrice))}
        </div>
      </div>;
    }
    if (type === 'PERCENT') {
      return (
        <div className="w-full flex flex-row gap-2 justify-start items-start">
          {/* promotion */}
          <div className="bg-[var(--muted-foreground)] rounded-lg w-fit text-sm text-[var(--accent)] px-1">
            {'-'}
            {item.voucher.value}
            {'%'}
          </div>
          {/* origin price */}
          <div className="text-[var(--muted-foreground)] line-through text-xs">
          {formatPrice(Number(item.minPrice))}
          </div>
        </div>
      );
    }
    if (type === 'FIXED') {
      return (
        <div className="w-full flex flex-col gap-2 justify-start items-start">
          {/* promotion */}
          <div className="bg-[var(--muted-foreground)] rounded-lg w-fit text-sm text-[var(--accent)] px-1">
            {'- '}
            {formatPrice(Number(item.voucher.value))}
          </div>
          {/* origin price */}
          <div className="text-[var(--muted-foreground)] line-through text-xs">
          {formatPrice(Number(item.minPrice))}
          </div>
        </div>
      );
    }
  };

  const renderSalePrice = (type: string | null, value: number | null) => {
    if (type === null || value === null) {
      return <p className="font-medium">{formatPrice(item.minPrice)}đ </p>;
    }
    if (type === 'PERCENT' && value !== null) {
      return (
        <p className="text-[var(--destructive)] font-medium">
          {formatPrice((item.minPrice * value) / 100)}
        </p>
      );
    }
    if (type === 'FIXED' && value !== null) {
      return (
        <p className="text-[var(--destructive)] font-medium">
          {formatPrice(item.minPrice - value)}
        </p>
      );
    }
  };

  return (
    <div className="flex flex-col justify-start items-start flex-1/5 border border-gray-200 rounded-lg gap-1 hover:cursor-pointer p-1">
      <img src={item.imageUrl} alt="thumbnail" />
      <Separator />
      <div className="p-1">
        <div className="p-2">
          <p>{item.title}</p>
          <RatingStars value={item.rating} />
          {/* render sale price if items has */}
          {renderSalePrice(item.voucher.type, item.voucher.value)}
          {renderPromotionType(item.voucher.type)}
        </div>
        <Separator />
        <p className="p-2 text-[var(--muted-foreground)] text-xs">
          Made in {'VN'}
        </p>
      </div>
    </div>
  );
};
