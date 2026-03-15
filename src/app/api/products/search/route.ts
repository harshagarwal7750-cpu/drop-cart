import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { category: { contains: query } },
          { brand: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
      },
      take: 8,
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
