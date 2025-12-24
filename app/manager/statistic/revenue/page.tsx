'use client';

import ChartAreaRevenue from '../../../../features/manager/statistic/revenue/components/chart-area-revenue';
import OrderStatusRate from '../../../../features/manager/statistic/revenue/components/chart-order-status-rate';
import TopProduct from '../../../../features/manager/statistic/revenue/components/chart-top-products';
import TableTopProduct from '../../../../features/manager/statistic/revenue/components/table-top-product';

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
