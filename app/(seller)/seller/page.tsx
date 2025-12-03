import data from './data.json';
import { SectionCardsSeller } from '@/app/(seller)/_components/sidebar/section-cards-seller';
import { ChartAreaInteractiveSeller } from '@/app/(seller)/_components/sidebar/chart-area-interactive-seller';
import { DataTableSeller } from '@/app/(seller)/_components/sidebar/data-table-seller';

export default function AdminIndexPage() {
  return (
    <>
      <SectionCardsSeller />
      <div className="px-4 lg:px-6 bg-background-secondary">
        <ChartAreaInteractiveSeller />
      </div>
      <DataTableSeller data={data} />
    </>
  );
}
