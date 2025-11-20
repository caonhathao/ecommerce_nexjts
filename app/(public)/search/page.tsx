'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SearchFilters, SearchProduct } from '@/types/product.data-types';
import { Card, CardContent } from '@/components/ui/card';
import { SearchFiltersPanel } from '@/app/(public)/search/_components/search-filters-panel';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductItem } from '@/app/(public)/_components/product-item';
import { SearchSortBar } from '@/app/(public)/search/_components/search-sort-bar.tsxsearch-sort-bar';
import { useCategories } from '@/hooks/use-categories';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const { categories } = useCategories();

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    categoryId: searchParams.get('categoryId') || undefined,
    shopId: searchParams.get('shopId') || undefined,
    minPrice: searchParams.get('minPrice') || undefined,
    maxPrice: searchParams.get('maxPrice') || undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 20,
  });

  const buildSearchParams = (filters: SearchFilters) => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.shopId) params.set('shopId', filters.shopId);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    params.set('sortBy', filters.sortBy);
    params.set('sortOrder', filters.sortOrder);
    params.set('page', String(filters.page));
    params.set('limit', String(filters.limit));
    return params;
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = buildSearchParams(filters);
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      console.log('Fetched products:', data);
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    const params = buildSearchParams({ ...filters, ...newFilters, page: 1 });
    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    const params = buildSearchParams({ ...filters, page });
    router.replace(`/search?${params.toString()}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    // Tiki Background Color: #F5F5FA
    <div className="min-h-screen bg-[#F5F5FA]">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb / Header Area */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-medium text-gray-900">
              {filters.query ? `Results for "${filters.query}"` : `All Products`}
            </h1>
            <span className="text-sm text-gray-500">({pagination.total} products)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 items-start">

          {/* Left Sidebar */}
          <aside className="hidden lg:block sticky top-20">
            <SearchFiltersPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={categories}
            />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {/* Top Sort Bar */}
            <SearchSortBar
              filters={filters}
              onFilterChange={handleFilterChange}
            />

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-[300px] rounded-lg bg-white" />
                ))}
              </div>
            ) : (!products || products.length === 0) ? (
              <Card className="border-none shadow-sm">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Product Grid - Reduced Gap to match Tiki's compact look */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {products.map((product) => (
                    <ProductItem
                      key={product.id}
                      item={{
                        id: product.id,
                        title: product.title,
                        minPrice: Number(product.minPrice),
                        ratingAvg: product.ratingAvg,
                        imageUrl: product.imageUrl || '',
                        voucher: product.voucher,
                        origin: product.origin || '',
                      }}
                      size="1"
                      // Ensure ProductItem card has 'bg-white hover:shadow-md transition-shadow'
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white hover:bg-gray-50"
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white hover:bg-gray-50"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium px-4">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white hover:bg-gray-50"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white hover:bg-gray-50"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}