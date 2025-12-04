'use client';
import { Loading } from '@/components/loading';
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
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import TableCellViewer from './table-cell-viewer';

const TopProduct = () => {
  const [data, setData] = React.useState<topProductChart[] | null>(null);
  const [timeRange, setTimeRange] = React.useState('month');
  const t = useTranslations('admin_statistic_page.chart_top_products');
  const amountTop: number = 5;
  const [openDetail, setOpenDetail] = React.useState<boolean>(false);
  const [id, setId] = React.useState<string | null>(null);

  const handleOpenDetail = (id: string) => {
    setOpenDetail(true);
    setId(id);
  };
  const chartConfig = {
    totalQuantity: {
      label: t('t_label_1'),
      color: 'var(--chart-2)',
    },
    label: {
      color: 'var(--background)',
    },
  } satisfies ChartConfig;

  const TITLE_MAP: Record<string, string> = {
    week: t('t_week'),
    month: t('t_month'),
    '3months': t('t_3months'),
    months: t('t_months'),
  };

  // "Derived State": Calculates immediately during the first render
  const subTitle = TITLE_MAP[timeRange] || t('t_month');

  useEffect(() => {
    const response = async () => {
      const res = await fetchData({
        baseUrl: '/api/manager/statistic/top-product',
        params: { amount: amountTop, period: timeRange, month: '' },
        setData: undefined,
        cacheType: 'default',
      });
      if (res) {
        console.log(res);
        setData(res.data);
      }
    };
    response();
  }, [amountTop, timeRange]);

  useEffect(() => {
    console.log(id);
  }, [id]);

  if (!data) return <Loading />;
  return (
    <div className="w-full h-full">
      <Card className="@container/card w-full h-full">
        <CardHeader>
          <CardTitle>{t('t_title')}</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              {t('t_data_from')} {subTitle} {t('t_most_recent')}
            </span>
            <span className="@[540px]/card:hidden">
              {subTitle} {t('t_most_recent')}
            </span>
          </CardDescription>
          <CardAction>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={setTimeRange}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
            >
              <ToggleGroupItem value="months">{t('t_months')}</ToggleGroupItem>
              <ToggleGroupItem value="3months">
                {t('t_3months')}
              </ToggleGroupItem>
              <ToggleGroupItem value="month">{t('t_month')}</ToggleGroupItem>
              <ToggleGroupItem value="week">{t('t_week')}</ToggleGroupItem>
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
                  {t('t_months')}
                </SelectItem>
                <SelectItem value="3months" className="rounded-lg">
                  {t('t_3months')}
                </SelectItem>
                <SelectItem value="month" className="rounded-lg">
                  {t('t_month')}
                </SelectItem>
                <SelectItem value="week" className="rounded-lg">
                  {t('t_week')}
                </SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent className="w-full h-full">
          {data.length !== 0 ? (
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
                  fill="var(--chart-2)"
                  radius={5}
                  onClick={(data) => handleOpenDetail(data.productId)}
                  className="hover:cursor-pointer"
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="w-full h-full flex justify-center items-center italic">
              {t('t_empty')}
            </div>
          )}
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
