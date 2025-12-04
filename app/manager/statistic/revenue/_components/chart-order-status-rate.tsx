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
import { fetchData } from '@/funcs/fetch';
import { orderStatusRateChart } from '@/types/manager.data-types';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';
import { Pie, PieChart } from 'recharts';

const OrderStatusRate = () => {
  const [data, setData] = React.useState<orderStatusRateChart[] | null>(null);
  const [timeRange, setTimeRange] = React.useState('month');
  const t = useTranslations('admin_statistic_page.chart_order_state_rate');

  const chartConfig = {
    STATUS: {
      label: t('t_label_1'),
    },
    PENDING: {
      label: t('t_label_2'),
      color: 'var(--chart-5)',
    },
    PAID: {
      label: t('t_label_3'),
      color: 'var(--chart-2)',
    },
    PROCESSING: {
      label: t('t_label_4'),
      color: 'var(--chart-3)',
    },
    CANCELED: {
      label: t('t_label_5'),
      color: 'var(--chart-1)',
    },
    REFUNDED: {
      label: t('t_label_6'),
      color: 'var(--chart-4)',
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
        baseUrl: '/api/manager/statistic/order-status',
        params: { period: timeRange },
        setData: undefined,
        cacheType: 'default',
      });

      if (res) {
        const formattedData = res.data.map(
          (item: orderStatusRateChart, index: number) => ({
            ...item,
            fill: `var(--chart-${index + 1})`,
          })
        );

        setData(formattedData);
      }
    };
    response();
  }, [timeRange]);

  //   useEffect(() => {
  //     console.log(data);
  //   }, [data]);

  if (!data) return <Loading />;

  return (
    <div className="w-full h-full">
      <Card className="@container/card">
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
