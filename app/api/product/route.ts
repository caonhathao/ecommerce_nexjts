import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Lấy pagination params
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Truy vấn sản phẩm
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        visibility: "PUBLIC",
        VoucherProduct: {
          some: {
            voucher: {
              type: { not: "SHIPPING" },
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        minPrice: true,
        images: {
          take: 1,
          select: { url: true },
        },
        VoucherProduct: {
          take: 1,
          select: {
            voucher: {
              select: {
                type: true,
                value: true,
                maxDiscount: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      distinct: ["id"], // tương đương DISTINCT ON (p.id)
      orderBy: { id: "asc" },
    });

    // Tổng số bản ghi để tính tổng trang
    const total = await prisma.product.count({
      where: {
        status: "PUBLISHED",
        visibility: "PUBLIC",
        VoucherProduct: {
          some: {
            voucher: {
              type: { not: "SHIPPING" },
            },
          },
        },
      },
    });

    // Chuẩn hóa dữ liệu trả về
    const formatted = products.map(p => ({
      id: p.id,
      title: p.title,
      minPrice: p.minPrice,
      imageUrl: p.images[0]?.url ?? null,
      voucher: p.VoucherProduct[0]?.voucher ?? null,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
