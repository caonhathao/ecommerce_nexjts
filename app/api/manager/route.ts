import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { NextResponse } from 'next/server';

export const GET = withAuth(async (userId: string) => {
  try {
    const data = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
      },
    });
    return NextResponse.json({ data: data });
  } catch (err) {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
