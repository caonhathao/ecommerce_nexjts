import { ChartAreaInteractive } from '@/features/manager/components/chart-area-interactive';
import { SectionCards } from '@/features/manager/components/section-cards';
import TableTopProduct from '@/features/manager/dashboard/components/table-top-product';

export default function Page() {
  return (
    <div className="flex flex-col gap-3 mt-3">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <TableTopProduct />
    </div>
  );
}
