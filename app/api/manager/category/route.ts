import { deleteFromCloudinary, uploadToCloudinary } from '@/lib/cloudinary';
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
    const formData = await request.formData();

    // console.log(formData);

    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({
        success: 400,
        data: {
          message: 'Missing file',
        },
      });
    }

    const arrBuffter = await file.arrayBuffer();
    const buffer = Buffer.from(arrBuffter);
    const upload = await uploadToCloudinary(buffer, {
      folder: 'category-images',
      resource_type: 'image',
      use_filename: true,
      unique_filename: true,
    });

    if (upload.secure_url.length === 0)
      return NextResponse.json({
        success: 403,
        data: {
          message: 'Upload failed!',
        },
      });

    if (formData.get('parentId') === '') {
      const current = await prisma.category.count({
        where: { parentId: null },
      });

      const newCategory = await prisma.category.create({
        data: {
          name: formData.get('name') as string,
          slug: formData.get('slug') as string,
          isActive: formData.get('isActive') === 'true' ? true : false,
          parentId: null,
          position: current - 1,
          imageUrl: upload.secure_url,
          publicId: upload.public_id,
        },
      });

      if (!newCategory) {
        return NextResponse.json(
          { error: 'Failed to create category' },
          { status: 403 }
        );
      }
    } else {
      const parent = await prisma.category.findFirst({
        where: {
          id: formData.get('parentId') as string,
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
          name: formData.get('name') as string,
          slug: formData.get('slug') as string,
          isActive: formData.get('isActive') === 'true' ? true : false,
          parentId: formData.get('parentId') as string,
          position: parent.position,
          imageUrl: upload.secure_url,
          publicId: upload.public_id,
        },
      });
      if (!newCategory) {
        return NextResponse.json(
          { error: 'Failed to create category' },
          { status: 403 }
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
    const formData = await request.formData();

    // console.log(formData);

    const file = formData.get('image') as File | null;

    const category = await prisma.category.findFirst({
      where: { id: formData.get('id') as string },
    });

    if (!category)
      return NextResponse.json({
        success: 400,
        data: {
          message: 'Category not found!',
        },
      });

    let update;
    if (file) {
      if (category.publicId)
        await deleteFromCloudinary(category.publicId ?? '', {
          invalidate: true,
        });

      const arrBuffter = await file.arrayBuffer();
      const buffer = Buffer.from(arrBuffter);
      const upload = await uploadToCloudinary(buffer, {
        folder: 'category-images',
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
      });

      //console.log('upload', upload);

      if (upload) {
        update = await prisma.category.update({
          where: {
            id: formData.get('id') as string,
          },
          data: {
            name: formData.get('name') as string,
            slug: formData.get('slug') as string,
            publicId: upload.public_id,
            imageUrl: upload.secure_url,
            isActive:
              (formData.get('isActive') as string) === 'true' ? true : false,
          },
        });
      }
    } else {
      update = await prisma.category.update({
        where: {
          id: formData.get('id') as string,
        },
        data: {
          name: formData.get('name') as string,
          slug: formData.get('slug') as string,
          isActive:
            (formData.get('isActive') as string) === 'true' ? true : false,
        },
      });
    }

    if (!update)
      return NextResponse.json({
        success: 400,
        data: {
          message: 'Update failed!',
        },
      });

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
    //delete from cloudinary first
    if (category.publicId !== '' && category.publicId)
      await deleteFromCloudinary(category.publicId, {
        invalidate: true,
      });
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
