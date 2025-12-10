import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSeller } from '@/lib/require-role';
import { manageProductSchema } from '@/app/(seller)/seller/products/_components/productSchema';
import { ResponseFactory } from '@/lib/api-response';

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
    return ResponseFactory.toNextResponse(
      ResponseFactory.error('Missing productId', 400)
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
    },
  });

  if (!product) {
    return ResponseFactory.toNextResponse(
      ResponseFactory.error('Product not found', 404)
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
    keywords: product.keywords ?? [],
  };

  return ResponseFactory.toNextResponse(ResponseFactory.success(normalized));
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ productId: string }> }
) {
  const prams = await props.params;
  try {
    const body = await req.json();
    const parsed = manageProductSchema.parse(body);

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
      keywords: parsed.keywords ?? [],
    };

    if (parsed.shopId) {
      updateData.shopId = parsed.shopId;
    }

    const product = await prisma.product.update({
      where: { id: prams.productId },
      data: updateData,
    });

    return ResponseFactory.toNextResponse(ResponseFactory.success(product));
  } catch (error: any) {
    return ResponseFactory.toNextResponse(
      ResponseFactory.error(error.message, 400)
    );
  }
}
