import { Prisma } from '@/lib/generated/prisma';
import { prisma } from '@/lib/prisma'; // Adjust path to your prisma client instance
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  try {
    // 1. Parse Query Parameters
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActiveParam = searchParams.get('isActive');

    // specific filter for parentId (e.g., fetch only root categories with "null")
    const parentId = searchParams.get('parentId');

    // Validate pagination to prevent errors
    const currentPage = Math.max(page, 1);
    const itemsPerPage = Math.max(limit, 1);
    const skip = (currentPage - 1) * itemsPerPage;

    // 2. Build the Where Clause dynamically
    const where: Prisma.CategoryWhereInput = {
      AND: [
        // Search logic (Case insensitive usually requires specific DB config,
        // but usually 'contains' works well for standard use)
        search
          ? {
              name: {
                contains: search,
                mode: 'insensitive', // valid if using Postgres/MongoDB
              },
            }
          : {},

        // Filter by Active status if provided
        isActiveParam !== ''
          ? {
              isActive: isActiveParam === 'true',
            }
          : {}, 
          
          // Otherwise (if parentId is 'null' OR parentId is missing), filter for root categories.
        // If parentId exists AND it's not the string 'null', filter by that specific ID.
        parentId && parentId !== 'null'
          ? { parentId: parentId } // A specific UUID was provided
          : { parentId: null }, // Default to root categories
      ],
    };

    // 3. Execute Queries in Transaction (Best Practice)
    const [categories, total] = await prisma.$transaction([
      prisma.category.findMany({
        where,
        skip,
        take: itemsPerPage,
        orderBy: {
          position: 'asc', // Default sort by position
        },
        // Include useful relation data
        include: {
          _count: {
            select: {
              children: true,
            },
          },
        },
      }),
      prisma.category.count({ where }),
    ]);

    // 4. Calculate Pagination Meta
    const totalPages = Math.ceil(total / itemsPerPage);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    // 5. Return Response
    return NextResponse.json(
      {
        data: categories,
        meta: {
          total,
          page: currentPage,
          limit: itemsPerPage,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
