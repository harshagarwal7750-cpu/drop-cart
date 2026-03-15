/**
 * POST /api/flash-sale/init
 * 
 * Initialize a flash sale for a specific product.
 * Sets inventory gate + resets queue and rate limits.
 */

import { NextResponse, NextRequest } from "next/server";
import { initializeInventory, getSnapshot } from "@/lib/flash-sale/inventory-gate";
import { clearQueue } from "@/lib/flash-sale/queue";
import { resetRateLimits } from "@/lib/flash-sale/rate-limiter";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, stock } = body;

    if (!productId || !stock) {
      return NextResponse.json(
        { status: "error", message: "productId and stock are required" },
        { status: 400 }
      );
    }

    // Fetch the product to verify it exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { status: "error", message: "Product not found" },
        { status: 404 }
      );
    }

    // Update sale times
    await prisma.product.update({
      where: { id: productId },
      data: {
        saleStartTime: new Date(),
        saleEndTime: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // Initialize in-memory inventory gate
    initializeInventory(stock);

    // Clear any previous queue and rate limits
    clearQueue();
    resetRateLimits();

    return NextResponse.json({
      status: "success",
      message: `Flash sale initialized for "${product.name}" with ${stock} units`,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
      },
      snapshot: getSnapshot(),
    });
  } catch (error) {
    console.error("Flash sale init error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to initialize flash sale" },
      { status: 500 }
    );
  }
}
