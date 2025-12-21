import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { manageProductSchema } from '@/app/(seller)/seller/products/_components/productSchema';
import { Prisma } from '@/lib/generated/prisma';
import { requireSeller } from '@/lib/require-role';
import { ResponseFactory } from '@/lib/api-response';
import { HttpStatus } from '@/types/api';

export async function GET() {
  try {
    const sellerSession = await requireSeller();
    if (!sellerSession) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error({
          message: 'Unauthorized',
          code: HttpStatus.UNAUTHORIZED,
        })
      );
    }

    // Find all shops owned by this seller
    const shops = await prisma.shop.findMany({
      where: { ownerId: sellerSession.user.id },
      select: { id: true },
    });
    const shopIds = shops.map((s) => s.id);

    // Get products for these shops
    const products = await prisma.product.findMany({
      where: { shopId: { in: shopIds } },
      select: {
        id: true,
        title: true,
        status: true,
        visibility: true,
        minPrice: true,
        maxPrice: true,
        currency: true,
        keywords: true,
        createdAt: true,
        updatedAt: true,
        shop: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        images: {
          select: {
            url: true,
            alt: true,
          },
          orderBy: { position: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Normalize Decimals to Numbers for JSON
    const normalized = products.map((p) => ({
      ...p,
      minPrice: Number(p.minPrice),
      maxPrice: Number(p.maxPrice),
    }));

    return ResponseFactory.toNextResponse(
      ResponseFactory.success({ data: normalized })
    );
  } catch (error) {
    return ResponseFactory.toNextResponse(ResponseFactory.handleError(error));
  }
}

export async function POST(req: NextRequest) {
  try {
    // FIX 1: Added missing 'await'
    const sellerSession = await requireSeller();
    if (!sellerSession) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error({
          message: 'Unauthorized',
          code: HttpStatus.UNAUTHORIZED,
        })
      );
    }

    const body = await req.json();
    const parsed = manageProductSchema.parse(body);

    if (!parsed.variants || parsed.variants.length === 0) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error({
          message: 'At least one product variant is required',
          code: HttpStatus.BAD_REQUEST,
        })
      );
    }

    if (!parsed.shopId) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error({
          message: 'Shop ID is required',
          code: HttpStatus.BAD_REQUEST,
        })
      );
    }

    const numericMinPrice = Math.min(...parsed.variants.map((v) => v.price));
    const numericMaxPrice = Math.max(...parsed.variants.map((v) => v.price));

    const minPriceDecimal = new Prisma.Decimal(numericMinPrice.toString());
    const maxPriceDecimal = new Prisma.Decimal(numericMaxPrice.toString());

    // Create product
    const product = await prisma.product.create({
      data: {
        title: parsed.title,
        slug: parsed.slug,
        origin: parsed.origin,
        description: parsed.description,
        status: parsed.status,
        visibility: parsed.visibility,
        attributes: parsed.attributes ?? {},
        minPrice: minPriceDecimal,
        maxPrice: maxPriceDecimal,
        categoryId: parsed.categoryId,
        currency: parsed.currency,
        shopId: parsed.shopId,
        images: {
          create:
            parsed.images?.map((img) => ({
              url: img.url,
              publicId: img.publicId,
              alt: img.alt,
              position: img.position,
            })) ?? [],
        },
        variants: {
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
      },
    });

    return ResponseFactory.toNextResponse(
      ResponseFactory.success({
        data: product,
        message: 'Product created successfully',
        code: HttpStatus.CREATED,
      })
    );
  } catch (error: any) {
    return ResponseFactory.toNextResponse(ResponseFactory.handleError(error));
  }
}
