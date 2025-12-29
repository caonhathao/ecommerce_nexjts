import { ResponseFactory } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { Prisma, Region, WarehouseStatus } from '@/lib/generated/prisma';
import { withAuth } from '@/lib/with-auth';
import { HttpStatus } from '@/types/api';
import { NextRequest } from 'next/server';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  try {
    if (!userId) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error({
          message: 't_unauthorized',
          code: HttpStatus.UNAUTHORIZED,
        })
      );
    }
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const filter = searchParams.get('filter');

    const whereClause: Prisma.WarehouseWhereInput = {};

    // Only apply the filter if the parameter is actually present in the URL
    // If 'filter' is missing, return all
    if (filter !== null && filter !== '') {
      whereClause.status = filter as WarehouseStatus;
    }

    const [total, data] = await prisma.$transaction([
      prisma.warehouse.count({ where: whereClause }),
      prisma.warehouse.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          region: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
    ]);

    return ResponseFactory.toNextResponse(
      ResponseFactory.paginated({
        data,
        page,
        limit,
        total,
        message: 't_success',
        code: HttpStatus.OK,
      })
    );
  } catch (err) {
    return ResponseFactory.toNextResponse(ResponseFactory.handleError(err));
  }
});

export const POST = withAuth(async (userId: string, request: NextRequest) => {
  try {
    if (!userId) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.handleError({
          message: 't_unauthorized_desc_noti',
          code: HttpStatus.UNAUTHORIZED,
        })
      );
    }

    const formData = await request.formData();

    const name = formData.get('name') as string;
    const location = formData.get('location') as string;
    const size = parseFloat(formData.get('size') as string);
    const status = formData.get('status') as WarehouseStatus;
    const storageAreaSize = parseInt(formData.get('storageAreaSize') as string);
    const slotSize = parseInt(formData.get('slotSize') as string);
    const region = formData.get('region') as Region;

    const newWarehouse = await prisma.warehouse.create({
      data: {
        name,
        location,
        size,
        status,
        storageAreaSize,
        slotSize,
        region,
      },
    });

    if (!newWarehouse) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error({
          message: 't_create_failed_desc_noti',
          code: HttpStatus.BAD_REQUEST,
        })
      );
    }

    return ResponseFactory.toNextResponse(
      ResponseFactory.success({
        data: null,
        message: 't_create_desc_noti',
        code: HttpStatus.CREATED,
      })
    );
  } catch (err) {
    return ResponseFactory.toNextResponse(ResponseFactory.handleError(err));
  }
});
