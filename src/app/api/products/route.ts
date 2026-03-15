import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(products || []);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: Number(data.price) || 0,
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
        flashSalePrice: data.flashSalePrice ? Number(data.flashSalePrice) : null,
        saleStartTime: data.saleStartTime ? new Date(data.saleStartTime) : null,
        saleEndTime: data.saleEndTime ? new Date(data.saleEndTime) : null,
        category: data.category,
        brand: data.brand,
        images: JSON.stringify(data.images || []),
        stock: Number(data.stock) || 0,
        featured: Boolean(data.featured),
        tags: JSON.stringify(data.tags || []),
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
