import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { requireSeller } from '@/lib/require-role';
import { ShopMemberRole } from '@/lib/generated/prisma';
import { ResponseFactory } from '@/lib/api-response';

const createShopSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  description: z.string().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  logoPublicId: z.string().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  coverPublicId: z.string().nullable().optional(),
  contactEmail: z.string().email().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-');
}

export async function GET() {
  try {
    const session = await requireSeller();
    if (!session?.user?.id) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('Unauthenticated', 401)
      );
    }
    const sellerId = session.user.id;

    const shops = await prisma.shop.findMany({
      where: {
        OR: [
          { ownerId: sellerId },
          { members: { some: { userId: sellerId } } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        coverUrl: true,
        status: true,
        contactEmail: true,
        contactPhone: true,
        ratingAvg: true,
        ratingCount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const normalized = shops.map((s) => ({
      ...s,
      ratingAvg: Number(s.ratingAvg),
    }));

    return ResponseFactory.toNextResponse(ResponseFactory.success(normalized));
  } catch (err: any) {
    return ResponseFactory.toNextResponse(
      ResponseFactory.error(err?.message ?? 'Server error', 500)
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.slug && body.name) {
      body.slug = slugify(body.name);
    }

    const parse = createShopSchema.safeParse(body);
    if (!parse.success) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error(
          'Validation failed: ' + parse.error.flatten(),
          400
        )
      );
    }
    const payload = parse.data;

    const session = await getSessionUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    const ownerId = session.user.id;

    const existing = await prisma.shop.findUnique({
      where: { slug: payload.slug },
    });
    if (existing) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('Slug already taken', 409)
      );
    }

    const shop = await prisma.shop.create({
      data: {
        ownerId,
        name: payload.name,
        slug: payload.slug,
        description: payload.description ?? null,
        logoUrl: payload.logoUrl ?? null,
        logoPublicId: payload.logoPublicId ?? null,
        coverUrl: payload.coverUrl ?? null,
        coverPublicId: payload.coverPublicId ?? null,
        contactEmail: payload.contactEmail ?? null,
        contactPhone: payload.contactPhone ?? null,
        status: 'PENDING',
      },
    });

    await prisma.shopMember.create({
      data: {
        shopId: shop.id,
        userId: ownerId,
        role: ShopMemberRole.OWNER,
      },
    });

    return ResponseFactory.toNextResponse(
      ResponseFactory.success(
        shop,
        `Shop ${shop.name} created successfully`,
        201
      )
    );
  } catch (err: any) {
    console.error('create shop error', err);
    return ResponseFactory.toNextResponse(
      ResponseFactory.error(err?.message ?? 'Server error', 500)
    );
  }
}
