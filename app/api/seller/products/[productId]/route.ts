import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSeller } from '@/lib/require-role';
import { manageProductSchema } from '@/app/(seller)/seller/products/_components/productSchema';
import { ResponseFactory } from '@/lib/api-response';
import { HttpStatus } from '@/types/api';

export async function GET(req: NextRequest) {
  const sellerSession = await requireSeller();
  if (!sellerSession) {
    // FIX 1: Use ResponseFactory with object args
    return ResponseFactory.toNextResponse(
      ResponseFactory.error({
        message: 'Unauthorized',
        code: HttpStatus.FORBIDDEN,
      })
    );
  }

  const { productId } = req.nextUrl.searchParams.has('productId')
    ? { productId: req.nextUrl.searchParams.get('productId') }
    : { productId: req.url.split('/').pop() };

  if (!productId) {
    // FIX 2: Pass object args
    return ResponseFactory.toNextResponse(
      ResponseFactory.error({
        message: 'Missing productId',
        code: HttpStatus.BAD_REQUEST,
      })
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
    // FIX 3: Pass object args
    return ResponseFactory.toNextResponse(
      ResponseFactory.error({
        message: 'Product not found',
        code: HttpStatus.NOT_FOUND,
      })
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

  // FIX 4: Pass object args ({ data: ... })
  return ResponseFactory.toNextResponse(
    ResponseFactory.success({ data: normalized })
  );
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

    // FIX 5: Pass object args
    return ResponseFactory.toNextResponse(
      ResponseFactory.success({ data: product })
    );
  } catch (error: any) {
    // FIX 6: Use handleError to catch Zod/Prisma errors automatically
    return ResponseFactory.toNextResponse(ResponseFactory.handleError(error));
  }
}
