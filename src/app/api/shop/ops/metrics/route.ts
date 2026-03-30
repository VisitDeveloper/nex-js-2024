import { NextResponse } from "next/server";
import { fetchAdminShopOpsMetrics } from "lib/shop-ops-metrics";

export async function GET() {
  const { metrics, error } = await fetchAdminShopOpsMetrics();
  if (error || !metrics) {
    return NextResponse.json(
      { error: error || "Could not calculate metrics" },
      { status: 502 }
    );
  }
  return NextResponse.json(metrics);
}
