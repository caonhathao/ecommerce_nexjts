'use client';
import { Loading } from '@/app/(public)/_components/loading';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { fetchData } from '@/funcs/fetch';
import { topProductChart } from '@/types/manager.data-types';
import React, { useEffect } from 'react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import TableCellViewer from './table-cell-viewer';

const chartConfig = {
  totalQuantity: {
    label: 'Số lượng',
    color: 'var(--chart-2)',
  },
  label: {
    color: 'var(--background)',
  },
} satisfies ChartConfig;

const TopProduct = () => {
  const [data, setData] = React.useState<topProductChart[] | null>(null);
  const [timeRange, setTimeRange] = React.useState('month');

  const amountTop: number = 5;
  const [openDetail, setOpenDetail] = React.useState<boolean>(false);
  const [id, setId] = React.useState<string | null>(null);

  const handleOpenDetail = (id: string) => {
    setOpenDetail(true);
    setId(id);
  };

  const TITLE_MAP: Record<string, string> = {
    week: '7 ngày',
    month: '30 ngày',
    '3months': '90 ngày',
    months: '12 tháng',
  };

  // "Derived State": Calculates immediately during the first render
  const subTitle = TITLE_MAP[timeRange] || '30 ngày';

  useEffect(() => {
    const response = async () => {
      const res = await fetchData({
        baseUrl: '/api/manager/statistic/top-product',
        params: { amount: amountTop, period: timeRange, month: '' },
        setData: undefined,
        cacheType: 'default',
      });
      if (res) {
        setData(res);
      }
    };
    response();
  }, [amountTop, timeRange]);

  useEffect(() => {
    console.log(id);
  }, [id]);

  if (!data) return <Loading />;
  return (
    <div className="w-[50%]">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Top sản phẩm</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Dữ liệu từ {subTitle} gần nhất
            </span>
            <span className="@[540px]/card:hidden">{subTitle} gần nhất</span>
          </CardDescription>
          <CardAction>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={setTimeRange}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
            >
              <ToggleGroupItem value="months">12 tháng</ToggleGroupItem>
              <ToggleGroupItem value="3months">3 tháng</ToggleGroupItem>
              <ToggleGroupItem value="month">30 ngày</ToggleGroupItem>
              <ToggleGroupItem value="week">7 ngày</ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                size="sm"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Last 3 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="months" className="rounded-lg">
                  12 tháng
                </SelectItem>
                <SelectItem value="3months" className="rounded-lg">
                  3 tháng
                </SelectItem>
                <SelectItem value="month" className="rounded-lg">
                  30 ngày
                </SelectItem>
                <SelectItem value="week" className="rounded-lg">
                  7 ngày
                </SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={data ?? undefined}
              layout="vertical"
              margin={{
                left: -20,
              }}
            >
              <XAxis type="number" dataKey="totalQuantity" hide />
              <YAxis
                dataKey="title"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="totalQuantity"
                fill="var(--color-desktop)"
                radius={5}
                onClick={(data) => handleOpenDetail(data.productId)}
                className="hover:cursor-pointer"
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <TableCellViewer
        id={id}
        openDetail={openDetail}
        SetOpenDetail={setOpenDetail}
      />
    </div>
  );
};

export default TopProduct;
