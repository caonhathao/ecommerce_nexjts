'use client';

import ChartAreaRevenue from './_components/chart-area-revenue';
import OrderStatusRate from './_components/order-status-rate';

const RevenuePage = () => {
  return (
    <div className="w-full flex flex-col p-3 gap-3">
      <ChartAreaRevenue />
      <div className="w-full flex flex-row gap3">
        <OrderStatusRate />
      </div>
    </div>
  );
};

export default RevenuePage;
