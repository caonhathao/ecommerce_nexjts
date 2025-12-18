import { ResponseFactory } from '@/lib/api-response';
import { deleteFromCloudinary, uploadToCloudinary } from '@/lib/cloudinary';
import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';
import { withAuth } from '@/lib/with-auth';
import { StatusCodeIdentify as StatusCode } from '@/types/api';
import { NextRequest } from 'next/server';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  try {
    // 1. Parse Query Parameters
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActiveParam = searchParams.get('filter');

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

    const payload = {
      data: categories,
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
        total,
        totalPages: Math.ceil(total / itemsPerPage),
      },
    };

    return ResponseFactory.toNextResponse(
      ResponseFactory.success(payload, 't_success', StatusCode.success)
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return ResponseFactory.toNextResponse(
      ResponseFactory.error(
        't_internal_server_error',
        StatusCode.internalServerError,
        error instanceof Error ? { detail: error.message } : undefined
      )
    );
  }
});

export const POST = withAuth(async (userId: string, request: NextRequest) => {
  try {
    const formData = await request.formData();

    // console.log(formData);

    const file = formData.get('image') as File | null;

    if (!file) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('t_missing_file', StatusCode.badRequest)
      );
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
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('t_upload_failed', StatusCode.forbidden)
      );

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
        return ResponseFactory.toNextResponse(
          ResponseFactory.error('t_creation_failed', StatusCode.forbidden)
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
        return ResponseFactory.toNextResponse(
          ResponseFactory.error('t_parent_not_found', StatusCode.notFound)
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
        return ResponseFactory.toNextResponse(
          ResponseFactory.error('t_creation_failed', StatusCode.forbidden)
        );
      }
    }
    return ResponseFactory.toNextResponse(
      ResponseFactory.success(null, 't_success', StatusCode.success)
    );
  } catch (error) {
    console.error('Error parsing JSON body:', error);
    return ResponseFactory.toNextResponse(
      ResponseFactory.error(
        't_internal_server_error',
        StatusCode.internalServerError,
        error instanceof Error ? { detail: error.message } : undefined
      )
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
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('t_category_not_found', StatusCode.notFound)
      );

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
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('t_update_failed', StatusCode.forbidden)
      );

    return ResponseFactory.toNextResponse(
      ResponseFactory.success(null, 't_success', StatusCode.success)
    );
  } catch (error) {
    console.error('Error updating category:', error);
    return ResponseFactory.toNextResponse(
      ResponseFactory.error(
        't_internal_server_error',
        StatusCode.internalServerError,
        error instanceof Error ? { detail: error.message } : undefined
      )
    );
  }
});

export const DELETE = withAuth(async (userId: string, request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('id');
    if (!categoryId) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('t_missing_id', StatusCode.badRequest)
      );
    }
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('t_category_not_found', StatusCode.notFound)
      );
    }

    const product = await prisma.product.findMany({
      where: {
        categoryId: category.id,
      },
      select: {
        id: true,
      },
    });

    if (product.length !== 0)
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('t_category_in_use', StatusCode.badRequest)
      );

    //delete from cloudinary first
    if (category.publicId !== '' && category.publicId)
      await deleteFromCloudinary(category.publicId, {
        invalidate: true,
      });
    // Delete the category
    await prisma.category.delete({
      where: { id: categoryId },
    });
    return ResponseFactory.toNextResponse(
      ResponseFactory.success(null, 't_success', StatusCode.success)
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return ResponseFactory.toNextResponse(
      ResponseFactory.error(
        't_internal_server_error',
        StatusCode.internalServerError,
        error instanceof Error ? { detail: error.message } : undefined
      )
    );
  }
});
