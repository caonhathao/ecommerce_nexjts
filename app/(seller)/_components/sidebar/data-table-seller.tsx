'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { PaginationState } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';

// Import your reusable components
import { DataTable } from '@/app/(seller)/seller/orders/_components/order-data-table';
import { columns } from '@/app/(seller)/seller/orders/_components/order-column-table';
import { fetchApi } from '@/lib/client-fetch';
import { OrderDTO } from '@/types/dtos/order.dto';

export function DataTableSeller() {
  const t = useTranslations('seller.order_page');

  const [data, setData] = useState<OrderDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const fetchRecentOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiPage = pagination.pageIndex + 1;
      const params = new URLSearchParams();

      params.append('limit', pagination.pageSize.toString());
      params.append('page', apiPage.toString());
      params.append('timeRange', 'month');
      // params.append('status', 'PROCESSING');

      const res = await fetchApi<OrderDTO[]>(
        `/api/seller/orders?${params.toString()}`,
        { cache: 'no-store' }
      );

      if (res.success && res.data) {
        setData(res.data);

        if (res.meta?.pagination) {
          setPageCount(res.meta.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard orders', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  // Initial Load & Refresh when pagination changes
  useEffect(() => {
    fetchRecentOrders();
  }, [fetchRecentOrders]);

  const handleRefresh = () => {
    fetchRecentOrders();
  };

  if (isLoading && data.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 bg-background rounded-lg border">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-background rounded-xl border border-border shadow-sm">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-lg">Recent Orders</h3>
        <p className="text-sm text-muted-foreground">
          Latest transaction activities
        </p>
      </div>

      <DataTable
        columns={columns(t, handleRefresh)}
        data={data}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  );
}
