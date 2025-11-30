import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';

//query api
//get all data of one product
export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const id = String(searchParams.get('id'));
  try {
    const data = await prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        profile: {
          select: {
            emailForBill: true,
            phone: true,
            gender: true,
          },
        },
        shopsOwned: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        shopMemberships: {
          select: {
            shop: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      success: false,
      data: {
        message: 'Not found',
      },
    });
  }
});

//if pass, update status and visibility of product
// export const POST = withAuth(async (userId: string, request: NextRequest) => {
//   const { searchParams } = new URL(request.url);

//   const id = String(searchParams.get('id'));
//   try {
//     const body = await request.json();
//     const { status } = body;

//     if (!id) {
//       return NextResponse.json(
//         { success: false, error: 'Missing id' },
//         { status: 400 }
//       );
//     }

//     if (!status) {
//       return NextResponse.json(
//         { success: false, error: 'Missing status field' },
//         { status: 400 }
//       );
//     }

//     // Update product status and visibility (adjust values to match your schema/enums)
//     await prisma.shop.update({
//       where: { id },
//       data: {
//         status: status,
//       },
//     });

//     return NextResponse.json({ success: true });
//   } catch (err) {
//     return NextResponse.json(
//       { success: false, error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// });
