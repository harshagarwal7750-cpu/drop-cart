/**
 * POST /api/flash-sale/purchase
 * 
 * Main flash sale purchase endpoint.
 * Flow: Rate Limit → Atomic Inventory Decrement → DB Order → Confirm Slot
 * 
 * The atomic inventory gate (in-memory, mutex-locked) prevents overselling.
 * Prisma handles persistent order creation + stock deduction.
 */

import { NextResponse, NextRequest } from "next/server";
import { atomicDecrement, confirmSlot, releaseSlot, isSaleActive, getSnapshot } from "@/lib/flash-sale/inventory-gate";
import { checkRateLimit } from "@/lib/flash-sale/rate-limiter";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, quantity = 1 } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { status: "error", message: "userId and productId are required" },
        { status: 400 }
      );
    }

    // ─── Step 1: Rate Limiting (3 req/s per user) ────────────
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      return NextResponse.json({
        status: "rate_limited",
        message: `Too many requests. Retry in ${rateLimit.retryAfterMs}ms`,
        retryAfterMs: rateLimit.retryAfterMs,
      }, { status: 429 });
    }

    // ─── Step 2: Atomic Inventory Decrement (Mutex-locked) ───
    // All attempts go through the gate so rejectedAttempts is properly counted
    const decr = await atomicDecrement(userId, quantity);

    if (!decr.success) {
      return NextResponse.json({
        status: "failed",
        message: decr.message,
        remainingStock: decr.remainingStock,
        snapshot: getSnapshot(),
      }, { status: 409 });
    }

    // ─── Step 4: Create order in database ────────────────────
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        await releaseSlot(decr.slotId!);
        return NextResponse.json({ status: "failed", message: "Product not found" }, { status: 404 });
      }

      const salePrice = Number(product.flashSalePrice || product.price);

      // Deduct DB stock
      await prisma.product.update({
        where: { id: productId },
        data: { stock: Math.max(0, product.stock - quantity) },
      });

      // Create order
      const order = await prisma.order.create({
        data: {
          totalAmount: salePrice * quantity,
          status: "PAID",
          customerName: `User_${userId.slice(0, 8)}`,
          items: {
            create: {
              productId: product.id,
              quantity,
              price: salePrice,
            },
          },
        },
      });

      // ─── Step 5: Confirm Slot ──────────────────────────────
      await confirmSlot(decr.slotId!);

      return NextResponse.json({
        status: "success",
        message: "Order confirmed",
        orderId: order.id,
        totalAmount: order.totalAmount,
        snapshot: getSnapshot(),
      });

    } catch (dbError) {
      console.error("DB error:", dbError);
      await releaseSlot(decr.slotId!);
      return NextResponse.json({
        status: "failed",
        message: "Order creation failed — inventory slot released",
        snapshot: getSnapshot(),
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
