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
          message: 't_unauthorized_desc_noti',
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
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    if (user?.role === 'seller') {
      whereClause.status = 'OPEN';
    }

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
        message: 't_success_desc_noti',
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
    const street = formData.get('street') as string;
    const ward = formData.get('ward') as string;
    const district = formData.get('district') as string;
    const city = formData.get('city') as string;
    const size = parseFloat(formData.get('size') as string);
    const status = formData.get('status') as WarehouseStatus;
    const totalStorageArea = parseInt(
      formData.get('totalStorageArea') as string
    );
    const totalSlot = parseInt(formData.get('totalSlot') as string);
    const region = formData.get('region') as Region;

    const address = formData.get('address') as string;

    const newWarehouse = await prisma.warehouse.create({
      data: {
        name,
        street,
        ward,
        district,
        city,
        address,
        size,
        status,
        totalStorageArea,
        totalSlot,
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

    //craete empty storage by all amount of storage area in one warehouse
    Array.from({ length: totalStorageArea }).map(() => {
      prisma.storageArea.create({
        data: {
          warehouseId: newWarehouse.id,
          name: 'STORAGE',
          type: 'GENERAL_STORAGE',
          status: 'CLOSED',
          totalSlot: 1,
          totalRows: 1,
          totalFloor: 1,
        },
      });
    });

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

export const DELETE = withAuth(async (userId: string, request: NextRequest) => {
  try {
    if (!userId) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error({
          message: 't_unauthorized_desc_noti',
          code: HttpStatus.UNAUTHORIZED,
        })
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error({
          message: 't_missing_query',
          code: HttpStatus.BAD_REQUEST,
        })
      );
    }

    const slots = await prisma.slot.count({
      where: {
        warehouseId: id,
        status: 'OCCUPIED',
      },
    });

    const warehouse = await prisma.warehouse.findFirst({
      where: { id: id },
      select: { status: true },
    });

    if (slots > 0 || warehouse?.status !== 'CLOSED') {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error({
          message: 't_del_warehouse_failed_desc_noti',
          code: HttpStatus.BAD_REQUEST,
        })
      );
    }

    const res = await prisma.warehouse.delete({
      where: {
        id: id,
      },
    });

    return ResponseFactory.toNextResponse(
      ResponseFactory.success({
        data: res,
        message: 't_del_desc_noti',
        code: HttpStatus.OK,
      })
    );
  } catch (err) {
    return ResponseFactory.toNextResponse(ResponseFactory.handleError(err));
  }
});
