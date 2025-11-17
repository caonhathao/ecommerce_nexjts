import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';
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

export const POST = withAuth(async (userId: string, request: NextRequest) => {
  try {
    const body = await request.json();

    const { name, slug, isActive, parentId } = body;

    console.log(body);

    if (parentId === '') {
      const current = await prisma.category.count({
        where: { parentId: null },
      });

      const newCategory = await prisma.category.create({
        data: {
          name: name,
          slug: slug,
          isActive: isActive === 'true' ? true : false,
          parentId: null,
          position: current - 1,
        },
      });

      if (!newCategory) {
        return NextResponse.json(
          { error: 'Failed to create category' },
          { status: 500 }
        );
      }
    } else {
      const parent = await prisma.category.findFirst({
        where: {
          id: body.parentId,
        },
        select: {
          position: true,
        },
      });

      if (!parent) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 404 }
        );
      }

      const newCategory = await prisma.category.create({
        data: {
          name: name,
          slug: slug,
          isActive: isActive === 'true' ? true : false,
          parentId: parentId,
          position: parent.position,
        },
      });
      if (!newCategory) {
        return NextResponse.json(
          { error: 'Failed to create category' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        message: 'Data received successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error parsing JSON body:', error);
    // This error will trigger if the body is not valid JSON
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 } // 400 Bad Request is more accurate here
    );
  }
});

export const PUT = withAuth(async (userId: string, request: NextRequest) => {
  try {
    const body = await request.json();
    const { id, name, slug, isActive, parentId } = body;
    const updatedCategory = await prisma.category.update({
      where: { id: id },
      data: {
        name: name,
        slug: slug,
        isActive: isActive === 'true' ? true : false,
        parentId: parentId === '' ? null : parentId,
      },
    });
    if (!updatedCategory) {
      return NextResponse.json(
        { error: 'Failed to update category' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: 'Category updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (userId: string, request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('id');
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    // Delete the category
    await prisma.category.delete({
      where: { id: categoryId },
    });
    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
