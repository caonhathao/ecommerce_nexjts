import { Separator } from "@/components/ui/separator";
import { productDataTypes } from "@/types/public.data-types";
import { formatPrice } from "./global-function";
import { RatingStars } from "./rating-starts";

interface ProductItemProps {
  item: productDataTypes;
}

export const ProductItem = ({ item }: ProductItemProps) => {
  return (
    <div className="flex flex-col justify-start items-start flex-1/5 border border-gray-200 rounded-lg gap-1 hover:cursor-pointer">
      <img src={item.image} alt="thumbnal" />
      <Separator />
      <div className="p-1">
        <div className="p-2">
          <p>{item.product_name}</p>
          <RatingStars value={item.rating} />
          {/* render sale price if items has */}
          {item.promotion !== 0 ? (
            <p className="text-[var(--destructive)] font-medium">
              {formatPrice((item.price * item.promotion) / 100)}đ
            </p>
          ) : (
            <p className="font-medium">{formatPrice(item.price)}đ </p>
          )}
          {item.promotion !== 0 ? (
            <div className="w-full flex flex-row gap-2 justify-start items-start">
              {/* promotion */}
              <div className="bg-gray-200 rounded-lg w-fit text-sm">
                {"-"}
                {item.promotion}
                {"%"}
              </div>
              {/* origin price */}
              <div className="text-[var(--muted-foreground)] line-through text-xs">
                {formatPrice(item.price)}đ
              </div>
            </div>
          ) : null}
        </div>
        <Separator />
        <p className="p-2 text-[var(--muted-foreground)] text-xs">
          Made in {item.origin}
        </p>
      </div>
    </div>
  );
};
