import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getSessionUser } from '@/lib/auth';
import { getSellerDashboardStats } from '@/app/data/section-cards-data';
import { formatPrice } from '@/lib/utils';

export async function SectionCardsSeller() {
  const session = await getSessionUser();

  if (!session) {
    return null;
  }

  const stats = await getSellerDashboardStats(session.user.id);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Today&apos;s Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatPrice(stats.todayRevenue)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.revenueChange >= 0 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {stats.revenueChange >= 0 ? '+' : ''}
              {stats.revenueChange}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.revenueChange >= 0 ? 'Up' : 'Down'} from yesterday{' '}
            {stats.revenueChange >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">Compared to previous day</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Orders to Fulfill</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.ordersToFulfill}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.ordersChange >= 0 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {stats.ordersChange >= 0 ? '+' : ''}
              {stats.ordersChange}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Processing orders today{' '}
            {stats.ordersChange >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Requires immediate attention
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Low Stock Items</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.lowStockItems}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.stockChange >= 0 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {stats.stockChange >= 0 ? '+' : ''}
              {stats.stockChange}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.lowStockItems > 0 ? 'Restock needed' : 'Stock levels OK'}{' '}
            {stats.stockChange >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Items with ≤10 units in stock
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Return Requests</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.returnRequests}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.returnsChange >= 0 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {stats.returnsChange >= 0 ? '+' : ''}
              {stats.returnsChange}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Pending return requests{' '}
            {stats.returnsChange >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Needs review and processing
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
