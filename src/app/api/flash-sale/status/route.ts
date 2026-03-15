/**
 * GET /api/flash-sale/status
 * 
 * Returns current inventory snapshot as JSON.
 * Frontend polls this endpoint for real-time updates.
 */

import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/flash-sale/inventory-gate";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getSnapshot());
}
