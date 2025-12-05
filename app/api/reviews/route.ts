import { getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';
import { ActionResponse } from '@/lib/service-response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get('id') || '';
    const filterBy = searchParams.get('filterBy');
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    if (!id) {
      return NextResponse.json({
        status: 403,
        data: { message: 'Missing id' },
      });
    }

    const whereClause: Prisma.ReviewWhereInput = {
      productId: id,
    };

    const orderClause: Prisma.ReviewOrderByWithAggregationInput = {
      createdAt: 'asc',
    };

    if (filterBy && !isNaN(Number(filterBy))) {
      whereClause.rating = Number(filterBy);
    }

    if (filterBy === 'newesst') orderClause.createdAt = 'desc';

    // Using Promise.all to run database queries in parallel makes API faster
    const [total, reviews, ratingGroups, imagesResult] = await Promise.all([
      // 1. Count total number of reviews (for pagination)
      prisma.review.count({
        where: { productId: id },
      }),

      // 2. Get the list of paginated reviews (for display list)
      prisma.review.findMany({
        where: whereClause,
        select: {
          id: true,
          rating: true,
          title: true,
          body: true,
          likes: true,
          images: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: orderClause,
      }),

      // 3. Group by rating to count the number of each star
      prisma.review.groupBy({
        by: ['rating'],
        where: { productId: id },
        _count: {
          _all: true, // hoặc rating: true
        },
      }),

      // 4. Get all the photos of this product (to make a Gallery)
      prisma.review.findMany({
        where: {
          productId: id,
          images: {
            not: undefined, // Only take reviews with pictures
          },
        },
        select: {
          images: true, // Only get the images field to lighten the query
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    // --- Process Rating data (Reformat for easy use in Frontend) ---
    // Create default object { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    ratingGroups.forEach((group) => {
      // group sẽ có dạng: { rating: 5, _count: { _all: 10 } }
      if (group.rating >= 1 && group.rating <= 5) {
        ratingBreakdown[group.rating as keyof typeof ratingBreakdown] =
          group._count._all;
      }
    });

    // --- Process Images data (Combine all sub-arrays into one large array) ---
    // imagesResult is an array of objects: [{ images: ["url1", "url2"] }, { images: ["url3"] }]
    // Need to convert to: ["url1", "url2", "url3"]
    const allImages = imagesResult
      .map((item) => item.images) // Get the value of the images field (json array or undefined)
      .flat() // Làm phẳng mảng lồng nhau
      .filter((img) => img !== null && img !== undefined); // filter trash values

    return NextResponse.json({
      success: true,
      data: {
        reviews, // List of reviews by page
        summary: {
          ratingBreakdown, // Object to count stars: { 5: 12, 4: 2 ... }
          totalImages: allImages.length,
          allImages, // Array containing all image links
        },
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/reviews/[id] error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return ActionResponse.toNextResponse(
        ActionResponse.error('Unauthorized', 401)
      );
    }
    const data = await req.json();

    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: userId,
        rating: data.rating,
        orderItemId: data.orderItemId || null,
        title: data.title || null,
        body: data.body || null,
        images:
          data.images && data.images.length > 0
            ? data.images?.map((i: any) => ({
                url: i.url,
                publicId: i.publicId,
                alt: i.alt,
                position: i.position,
              }))
            : null,
      },
    });
    return ActionResponse.toNextResponse(
      ActionResponse.success(review, 'Review successful', 201)
    );
  } catch (error) {
    console.error('POST /api/reviews error:', error);
    return ActionResponse.toNextResponse(
      ActionResponse.error('failed', 400, { errorDetail: [String(error)] })
    );
  }
}
