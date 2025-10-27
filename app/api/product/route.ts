import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    // Lấy query params (nếu có)
    const { searchParams } = new URL(req.url);
    const columns = searchParams.get("columns"); // ví dụ: "id,name,price"

    // Truy vấn dữ liệu (ví dụ với Prisma)
    const selectFields = columns
      ? Object.fromEntries(columns.split(",").map(col => [col, true]))
      : undefined;

    const products = await prisma.product.findMany({
      select: selectFields, // nếu undefined => lấy toàn bộ cột
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
