'use client';

import ChartAreaRevenue from './_components/chart-area-revenue';
import OrderStatusRate from './_components/chart-order-status-rate';
import TopProduct from './_components/chart-top-products';
import TableTopProduct from './_components/table-top-product';

const RevenuePage = () => {
  return (
    <div className="w-full flex flex-col p-3 gap-3">
      <ChartAreaRevenue />
      <div className="w-full grid grid-cols-2 gap-3 ">
        <OrderStatusRate />
        <TopProduct />
      </div>
      <TableTopProduct />
    </div>
  );
};

export default RevenuePage;
