'use client';
import { Button } from '@/components/ui/button';
import {
  productDataResponse,
  productItemType,
} from '@/types/public.data-types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loading } from '../../../../components/loading';
import { ProductItem } from '../../_components/product-item';

type TopDealItemsProps = {
  size: string; // This acts as the "Limit" per page
  limitItem?: string;
};

const sizeClasses = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-2',
  '3': 'grid-cols-3',
  '4': 'grid-cols-4',
  '5': 'grid-cols-5',
  '6': 'grid-cols-6',
};

export const SuggestDealToday = ({ size, limitItem }: TopDealItemsProps) => {
  const t = useTranslations('home_layout.suggest_deal_today');
  const [products, setProducts] = useState<productItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const gridClass =
    sizeClasses[size as keyof typeof sizeClasses] || 'grid-cols-4';
  const limit = limitItem ? parseInt(limitItem) : 10;

  const loadProducts = async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/product?page=${currentPage}&limit=${limit}&type=suggest`
      );
      const json = (await res.json()) as productDataResponse;

      if (json.data) {
        if (currentPage === 1) {
          setProducts(json.data);
        } else {
          setProducts((prev) => [...prev, ...json.data]);
        }

        // Check if we have reached the last page
        if (json.pagination && currentPage >= json.pagination.totalPages) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage);
  };

  if (!products.length && loading) return <Loading />;

  return (
    <div className="w-full flex flex-col justify-center items-center gap-2 bg-background-secondary rounded-lg mt-5 p-2">
      {/* Top Title */}
      <p className="w-full p-2 text-lg text-left font-bold">{t('title')}</p>

      {/* Product Grid */}
      <div className={`w-full grid ${gridClass} gap-3 p-2 overflow-x-auto`}>
        {products.map((item: productItemType, index) => (
          // Use item.id as key if unique, fallback to index
          <div key={`${item.id}-${index}`} className="w-full">
            <ProductItem item={item} />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="w-full flex justify-center items-center mt-4 mb-2">
          <Button
            variant="outline"
            className="text-primary min-w-[200px]"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : t('watch_more')}
          </Button>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <p className="text-sm text-muted-foreground my-2">
          You have reached the end.
        </p>
      )}
    </div>
  );
};
