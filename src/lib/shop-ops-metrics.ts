import { adminStrapiFetchHeaders } from "lib/admin-strapi";
import { getStrapiOrigin } from "lib/strapi-origin";
import {
  fetchStrapiCollectionWithError,
  type ShopOpsMetrics,
} from "lib/strapi-server-fetch";

function computeMetricsFromOrderEntities(ordersRaw: unknown[]): ShopOpsMetrics {
  const rows = Array.isArray(ordersRaw) ? ordersRaw : [];
  let totalRevenue = 0;
  let paidOrders = 0;
  let processingOrders = 0;

  for (const item of rows as { attributes?: { status?: string; totalAmount?: unknown } }[]) {
    const status = String(item.attributes?.status ?? "");
    const amt = Number(item.attributes?.totalAmount) || 0;
    totalRevenue += amt;
    if (status === "paid" || status === "delivered") paidOrders += 1;
    if (status === "processing" || status === "shipped") processingOrders += 1;
  }

  const totalOrders = rows.length;
  const aov = totalOrders === 0 ? 0 : totalRevenue / totalOrders;
  const conversionRate = totalOrders === 0 ? 0 : (paidOrders / totalOrders) * 100;

  return {
    totalOrders,
    totalRevenue,
    paidOrders,
    processingOrders,
    aov,
    conversionRate,
  };
}

/**
 * Loads order aggregates for the admin portal using the same Strapi auth as
 * `/portal/admin/orders` (staff JWT from cookies, else STRAPI_API_TOKEN fallback).
 */
export async function fetchAdminShopOpsMetrics(): Promise<{
  metrics: ShopOpsMetrics | null;
  error: string | null;
}> {
  const base = (
    getStrapiOrigin() ||
    process.env.NEXT_PUBLIC_BASE_API_URL_SERVER ||
    ""
  ).replace(/\/$/, "");
  if (!base) {
    return { metrics: null, error: "Strapi URL is not configured." };
  }

  const headers = await adminStrapiFetchHeaders();
  const qs = new URLSearchParams();
  qs.set("pagination[pageSize]", "200");
  qs.set("fields[0]", "status");
  qs.set("fields[1]", "totalAmount");

  const { data, error } = await fetchStrapiCollectionWithError(
    `${base}/api/orders?${qs.toString()}`,
    { headers }
  );

  if (error) {
    return { metrics: null, error };
  }

  return { metrics: computeMetricsFromOrderEntities(data), error: null };
}
