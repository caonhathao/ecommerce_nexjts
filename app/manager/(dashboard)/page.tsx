import { ChartAreaInteractive } from '@/app/manager/_components/chart-area-interactive';
import { SectionCards } from '@/app/manager/_components/section-cards';
import TableTopProduct from './_components/table-top-product';

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
