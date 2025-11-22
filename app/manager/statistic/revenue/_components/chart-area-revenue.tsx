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
import { revenueEleChart } from '@/types/manager.data-types';
import React, { useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

const ChartAreaRevenue = () => {
  const [data, setData] = React.useState<revenueEleChart[] | null>([]);
  const [timeRange, setTimeRange] = React.useState('month');

  const chartConfig = {
    visitors: {
      label: 'Visitors',
    },
    desktop: {
      label: 'Desktop',
      color: 'var(--primary)',
    },
    mobile: {
      label: 'Mobile',
      color: 'var(--primary)',
    },
  } satisfies ChartConfig;

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
        baseUrl: '/api/manager/statistic/revenue',
        params: { period: timeRange },
        setData: undefined,
        cacheType: 'default',
      });
      if (res) {
        setData(res);
      }
    };
    response();
  }, [timeRange]);

  // useEffect(() => {
  //   console.log(data);
  // }, [data]);

  if (!data) return <Loading />;

  // --- Here is the fixed code snippet ---

  const filteredData = data.filter((item) => {
    const date = new Date(item.date);
    const last = data.at(-1);
    const referenceDate = last && last.date ? new Date(last.date) : new Date();

    // Create the startDate from the referenceDate
    const startDate = new Date(referenceDate);

    if (timeRange === 'months') {
      // --- FIX ---
      // Instead of subtracting 360 days, we subtract 1 full year.
      // This is much more accurate and handles leap years correctly.
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else {
      // This logic remains the same for the other time ranges
      let daysToSubtract = 90; // Default for '3months'
      if (timeRange === 'month') {
        daysToSubtract = 30;
      } else if (timeRange === 'week') {
        daysToSubtract = 7;
      }
      startDate.setDate(startDate.getDate() - daysToSubtract);
    }

    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Tổng doanh thu</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Số liệu từ {subTitle} gần nhất
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
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
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="total"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
export default ChartAreaRevenue;
