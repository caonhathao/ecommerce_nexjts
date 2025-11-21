import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { requireSeller } from '@/lib/require-role';

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
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    const ownerId = session.user.id;

    const shops = await prisma.shop.findMany({
      where: { ownerId },
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

    return NextResponse.json(normalized, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 }
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
      return NextResponse.json(
        { error: parse.error.flatten() },
        { status: 400 }
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
      return NextResponse.json(
        { error: 'Slug already taken' },
        { status: 409 }
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
        status: 'ACTIVE',
      },
    });

    await prisma.shopMember.create({
      data: {
        shopId: shop.id,
        userId: ownerId,
        role: 'seller',
      },
    });

    return NextResponse.json({ shop }, { status: 201 });
  } catch (err: any) {
    console.error('create shop error', err);
    if (err?.code === 'P2002' && err?.meta?.target?.includes('slug')) {
      return NextResponse.json(
        { error: 'Slug already taken' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 }
    );
  }
}
