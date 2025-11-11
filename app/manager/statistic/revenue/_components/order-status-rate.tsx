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
    ChartLegend,
    ChartLegendContent,
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
import { orderStatusRateChart } from '@/types/manager.data-types';
import React, { useEffect } from 'react';
import { Pie, PieChart } from 'recharts';

const chartConfig = {
  STATUS: {
    label: 'Trạng thái',
  },
  PENDING: {
    label: 'Đang chờ',
    color: 'var(--chart-5)',
  },
  PAID: {
    label: 'Đã thanh toán',
    color: 'var(--chart-2)',
  },
  PROCESSING: {
    label: 'Đang xử lí',
    color: 'var(--chart-3)',
  },
  CANCELED: {
    label: 'Đã hủy',
    color: 'var(--chart-1)',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig;

const OrderStatusRate = () => {
  const [data, setData] = React.useState<orderStatusRateChart[] | null>(null);
  const [isReady, setIsReady] = React.useState<boolean>(false);
  const [timeRange, setTimeRange] = React.useState('month');
  const [subTitle, setSubTitle] = React.useState<string>('30 ngày');

  const fetchData = async (period: string, month?: string) => {
    try {
      const response = await fetch(
        `/api/manager/statistic/order-status?period=${period}&&month=${month}`
      );
      const parseData = await response.json();
      console.log(parseData.data);
      setData(parseData.data);
      setIsReady(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData(timeRange);
  }, []);

  useEffect(() => {
    fetchData(timeRange);
    switch (timeRange) {
      case 'week':
        setSubTitle('7 ngày');
        break;
      case 'month':
        setSubTitle('30 ngày');
        break;
      case '3months':
        setSubTitle('90 ngày');
        break;
      case 'months':
        setSubTitle('12 tháng');
        break;
      default:
        setSubTitle('30 ngày');
        break;
    }
  }, [timeRange]);

  useEffect(() => {
    if (data && !isReady) {
      const formattedData = data.map((item, index) => ({
        ...item, // Copy all existing properties (label, total)
        fill: `var(--chart-${index + 1})`, // Add the new 'fill' property
      }));

      // 3. Set the new array into your local state
      setData(formattedData);
      setIsReady(true);
    }
  }, [data]); // This effect re-runs whenever 'data' changes

  //   useEffect(() => {
  //     console.log(data);
  //   }, [data]);

  if (!data && isReady) return <Loading />;

  return (
    <div className="w-[50%]">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Tỉ lệ trạng thái đơn hàng</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              Dữ liệu từ {subTitle} gần nhất
            </span>
            <span className="@[540px]/card:hidden">Last 3 months</span>
          </CardDescription>
          <CardAction>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={setTimeRange}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
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
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie data={data ?? undefined} dataKey="total" nameKey={'label'} />
              <ChartLegend
                content={<ChartLegendContent nameKey="label" />}
                className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStatusRate;
