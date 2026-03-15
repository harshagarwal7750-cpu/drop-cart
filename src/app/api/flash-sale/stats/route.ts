/**
 * GET /api/flash-sale/stats
 * 
 * Returns current flash sale monitoring data for observability.
 */

import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/flash-sale/inventory-gate";
import { getQueueStatus } from "@/lib/flash-sale/queue";

export const dynamic = "force-dynamic";

export async function GET() {
  const inventory = getSnapshot();
  const queue = getQueueStatus();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    inventory,
    queue,
    health: {
      inventoryConsistent: inventory.stock >= 0,
      saleActive: inventory.saleActive,
      successRate: inventory.totalAttempts > 0
        ? Math.round((inventory.successfulOrders / inventory.totalAttempts) * 10000) / 100
        : 0,
    },
  });
}
