import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSeller } from '@/lib/require-role';
import { manageProductSchema } from '@/app/(seller)/seller/products/_components/productSchema';

export async function GET(req: NextRequest) {
  const sellerSession = await requireSeller();
  if (!sellerSession) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 403 }
    );
  }
  const { productId } = req.nextUrl.searchParams.has('productId')
    ? { productId: req.nextUrl.searchParams.get('productId') }
    : { productId: req.url.split('/').pop() };

  if (!productId) {
    return NextResponse.json(
      { success: false, error: 'Missing productId' },
      { status: 400 }
    );
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shop: { ownerId: sellerSession.user.id },
    },
    include: {
      images: true,
      variants: true,
      tags: { select: { tagId: true, tag: { select: { name: true, slug: true } } } },
    },
  });


  if (!product) {
    return NextResponse.json(
      { success: false, error: 'Product not found' },
      { status: 404 }
    );
  }

  const normalized = {
    ...product,
    minPrice: Number(product.minPrice),
    maxPrice: Number(product.maxPrice),
    variants: product.variants.map((v) => ({
      ...v,
      price: Number(v.price),
      compareAt: v.compareAt != null ? Number(v.compareAt) : null,
    })),
    tags: product.tags.map((t) => ({ tagId: t.tagId, name: (t as any).tag?.name })),

  };

  return NextResponse.json({ success: true, data: normalized })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const body = await req.json();
    const parsed = manageProductSchema.parse(body);

    const tagCreates =
      parsed.tags
        ?.map((t) => {
          if (t.tagId) {
            return { tag: { connect: { id: t.tagId } } };
          }
          if (t.name) {
            const slug = slugify(t.name);
            return {
              tag: {
                connectOrCreate: {
                  where: { slug },
                  create: { name: t.name, slug },
                },
              },
            };
          }
          return undefined as any;
        })
        .filter(Boolean) ?? [];

    const updateData: any = {
      title: parsed.title,
      slug: parsed.slug,
      origin: parsed.origin,
      description: parsed.description,
      status: parsed.status,
      visibility: parsed.visibility,
      attributes: parsed.attributes ?? {},
      categoryId: parsed.categoryId,
      currency: parsed.currency,
      images: {
        deleteMany: {},
        create:
          parsed.images?.map((img) => ({
            url: img.url,
            publicId: img.publicId,
            alt: img.alt,
            position: img.position,
          })) ?? [],
      },
      variants: {
        deleteMany: {},
        create:
          parsed.variants?.map((variant) => ({
            sku: variant.sku,
            name: variant.name,
            price: variant.price,
            image: variant.image,
            imagePublicId: variant.imagePublicId,
            compareAt: variant.compareAt,
            currency: variant.currency,
            stock: variant.stock,
            reserved: variant.reserved,
            weightGrams: variant.weightGrams,
            lengthMm: variant.lengthMm,
            widthMm: variant.widthMm,
            heightMm: variant.heightMm,
            attributes: variant.attributes ?? {},
            isActive: variant.isActive,
          })) ?? [],
      },
      tags: {
        deleteMany: {},
        create: tagCreates,
      },
    };

    if (parsed.shopId) {
      updateData.shopId = parsed.shopId;
    }

    const product = await prisma.product.update({
      where: { id: params.productId },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');