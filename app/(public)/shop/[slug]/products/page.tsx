'use client';
import { Loading } from '@/app/(public)/_components/loading';
import { ProductItem } from '@/app/(public)/_components/product-item';
import { fetchData } from '@/funcs/fetch';
import {
  productDataResponse,
  productItemType,
} from '@/types/public.data-types';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Pagination from '../../_components/pagination';

const ShopProduct = () => {
  const searchParams = useSearchParams();
  const [data, setData] = useState<productDataResponse | null>(null);
  const [nextPage, setNextPage] = useState<number>(1);

  const filter = searchParams.get('filter');
  const id = searchParams.get('id');

  console.log('filter: ', filter);
  console.log('id: ', id);

  useEffect(() => {
    fetchData({
      baseUrl: '/api/product/query',
      params: {
        shopId: id,
        filter: filter,
        page: nextPage,
        limit: 20,
      },
      setData: setData,
    });
  }, [nextPage]);

  const titlePage = useMemo(() => {
    if (filter === 'new') return 'Sẩn phẩm mới';
    if (filter === 'top') return 'Sản phẩm bán chạy';
    return 'Tất cả sản phẩm';
  }, [filter]);

  if (!data)
    return (
      <div className="w-screen h-screen">
        <Loading />
      </div>
    );

  return (
    <div className="h-fit flex flex-col justify-center items-center gap-3">
      <p className="w-fit text-nowrap font-semibold text-primary">
        {titlePage}
      </p>
      <div className="w-full grid grid-cols-5 gap-3">
        {data.data.map((value: productItemType, index) => (
          <ProductItem key={index} item={value} />
        ))}
      </div>
      <Pagination
        current={data.pagination.page}
        total={data.pagination.totalPages}
        setNext={setNextPage}
      />
    </div>
  );
};
export default ShopProduct;
