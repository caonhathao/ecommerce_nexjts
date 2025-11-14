import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';

// Define the 5 statuses we want to count
// (Matches your OrderStatus enum)
const STATUS_LIST_TO_COUNT = [
  'CANCELED',
  'PAID',
  'PENDING',
  'PROCESSING',
  'REFUNDED',
] as const;

// Helper type for our new statusCounts object
type StatusCounts = Record<(typeof STATUS_LIST_TO_COUNT)[number], number>;

// build api for calculator order-status by a week, a month, 3 months and months
// a week: show data (sum of each day) of 7 days lastest
// a month: show data (sum of each day) of 30 days lastest
// 3 months: show data (sum of each day) of 3 months latests
// months: show data (sum of each month) of 12 months lastest
export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  //period of time to show
  const period = searchParams.get('period')?.toString();

  //option: watch detail of any month (e.g., "2025-10")
  const monthParam = searchParams.get('month')?.toString();

  // --- 1. Base whereClause (Dates only) ---
  // IMPROVEMENT: We remove 'status: "PAID"' here so we can
  // query for all 5 statuses in our new query.
  const whereClause: Prisma.OrderWhereInput = {
    // status: 'PAID', // <-- Removed from here
  };

  // --- 2. Add date logic based on params ---
  const now = new Date();
  let startDate: Date;
  let endDate: Date = new Date(now.setHours(23, 59, 59, 999)); // End of today
  let groupByMonth = false;

  // This entire date logic block remains unchanged
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    // Option: View details of a specific month (group by day)
    const [year, month] = monthParam.split('-').map(Number);
    startDate = new Date(year, month - 1, 1); // First day of the month
    endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month
  } else {
    // Option: View a general period
    switch (period) {
      case 'week':
        // Data for the last 7 days (including today)
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        // Data for the last 30 days (including today)
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '3months':
        // Data for the last 90 days (including today)
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 89);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'months':
        // Data for the last 12 months (including this month)
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 11);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        groupByMonth = true;
        break;
      default:
        // Default to last 7 days
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
    }
  }

  // Add the date range to the base whereClause
  whereClause.placedAt = {
    gte: startDate,
    lte: endDate,
  };

  // --- 3. Fetch all data in a single transaction ---
  try {
    const [orders, statusGroups] = await prisma.$transaction([
      // Query 1: Get PAID orders for the revenue chart (same as before)
      prisma.order.findMany({
        where: {
          ...whereClause,
        },
        select: {
          grandTotal: true,
          placedAt: true,
        },
        orderBy: {
          placedAt: 'asc',
        },
      }),

      // Query 2: IMPROVEMENT - Get counts for the 5 statuses
      prisma.order.groupBy({
        by: ['status'] as const,
        _count: {
          _all: true, // <-- Changing this
        },

        orderBy: {
          status: 'asc',
        },
        // --- End Fix ---
        where: {
          ...whereClause,
          status: {
            in: [...STATUS_LIST_TO_COUNT],
          },
        },
      }),
    ]);

    // --- 4. Group data for REVENUE chart (from paidOrders) ---
    const groupedData = new Map<string, number>();
    let totalSum = 0;

    for (const order of orders) {
      if (!order.placedAt) continue;
      const dateKey = order.placedAt.toISOString();
      const key = groupByMonth
        ? dateKey.substring(0, 7) // 'YYYY-MM'
        : dateKey.substring(0, 10); // 'YYYY-MM-DD'

      const currentTotal = groupedData.get(key) || 0;
      const newTotal = currentTotal + order.grandTotal.toNumber();
      groupedData.set(key, newTotal);
      totalSum += order.grandTotal.toNumber();
    }

    // --- 5. Fill in gaps for REVENUE chart (from paidOrders) ---
    // This logic is also unchanged
    const chartData = [];
    const currentDate = new Date(startDate);
    const getUTCKey = (d: Date, byMonth: boolean) => {
      const iso = d.toISOString();
      return byMonth ? iso.substring(0, 7) : iso.substring(0, 10);
    };

    if (groupByMonth) {
      currentDate.setDate(1);
      while (currentDate <= endDate) {
        const key = getUTCKey(currentDate, true);
        chartData.push({
          date: key,
          total: groupedData.get(key) || 0,
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    } else {
      while (currentDate <= endDate) {
        const key = getUTCKey(currentDate, false);
        chartData.push({
          date: key,
          total: groupedData.get(key) || 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // --- 6. IMPROVEMENT: Process the status counts ---
    // Initialize our counts object with zeros
    const statusCounts: StatusCounts = {
      PENDING: 0,
      PAID: 0,
      PROCESSING: 0,
      CANCELED: 0,
      REFUNDED: 0,
    };

    // Fill in the counts from the database query
    for (const group of statusGroups) {
      // We check if the status is one we're tracking
      // --- FIX for TS errors ---
      // 1. Check if 'group.status' is one we track (e.g., 'PENDING')
      // 2. Check if 'group._count' is truthy (not null/undefined)
      // 3. Check if 'group._count' is an object. This is the fix
      //    for the 'in' operator error, as _count could be a number.
      if (
        group.status in statusCounts &&
        group._count &&
        typeof group._count === 'object'
      ) {
        // 4. Use '|| 0' as a fallback. This fixes the 'number | undefined'
        //    error by ensuring we always assign a 'number'.
        statusCounts[group.status as keyof StatusCounts] =
          group._count._all || 0;
      }
      // --- End Fix ---
    } // NEW: Transform the statusCounts object into the desired array format
    // --- 7. Return everything ---

    const statusCountsArray = Object.entries(statusCounts).map(
      ([status, count]) => ({
        label: status,
        total: count,
      })
    );

    return NextResponse.json({
      success: true,
      // UPDATED: Use the new array format
      data: statusCountsArray,
    });
  } catch (error) {
    console.error('Failed to fetch revenue data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
});
