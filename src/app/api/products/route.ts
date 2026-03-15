import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Convert string inputs to correct types based on our schema
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        flashSalePrice: data.flashSalePrice ? parseFloat(data.flashSalePrice) : null,
        saleStartTime: data.saleStartTime ? new Date(data.saleStartTime) : null,
        saleEndTime: data.saleEndTime ? new Date(data.saleEndTime) : null,
        category: data.category,
        brand: data.brand,
        images: JSON.stringify(data.images || []), // Serialize array to JSON string for SQLite
        stock: parseInt(data.stock),
        featured: data.featured || false,
        tags: JSON.stringify(data.tags || []),
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
