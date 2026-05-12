import AdminOrdersClient from "components/specific_elements/portal/admin-orders-client";
import {
  parseAdminOrderPaymentsFromOrder,
  type AdminOrderRow,
} from "lib/admin-order-row";
import {
  parseStrapiOrderShipmentFromOrder,
  shipmentSummaryByOrderIdFromStrapiList,
  type OrderShipmentSummary,
} from "lib/order-shipment";
import { parseStrapiShippingAddressFromOrder } from "lib/order-shipping-address";
import { adminStrapiFetchHeaders } from "lib/admin-strapi";
import { fetchStrapiCollectionWithError } from "lib/strapi-server-fetch";
import { getStrapiOrigin } from "lib/strapi-origin";

export const dynamic = "force-dynamic";

function asRecord(input: unknown): Record<string, unknown> | null {
  return input && typeof input === "object" ? (input as Record<string, unknown>) : null;
}

function withAttrs(input: unknown): Record<string, unknown> | null {
  const record = asRecord(input);
  if (!record) return null;
  const attrs = asRecord(record.attributes);
  return attrs ?? record;
}

function extractRelationMany(input: unknown): unknown[] {
  const rel = asRecord(input);
  if (rel && Array.isArray(rel.data)) return rel.data;
  if (Array.isArray(input)) return input;
  return [];
}

async function getOrders(userId?: number): Promise<{
  data: unknown[];
  error: string | null;
  shipmentFallback: Record<number, OrderShipmentSummary>;
}> {
  const base = (getStrapiOrigin() || process.env.NEXT_PUBLIC_BASE_API_URL_SERVER || "").replace(
    /\/$/,
    ""
  );
  const headers = await adminStrapiFetchHeaders();
  const qs = new URLSearchParams();
  qs.set("sort", "createdAt:desc");
  qs.set("pagination[pageSize]", "200");
  qs.set("populate[customerProfile][populate]", "user");
  qs.set("populate[items][populate][variant][populate]", "product");
  qs.set("populate[shippingAddress]", "true");
  qs.set("populate[shipment]", "true");
  qs.set("populate[paymentTransactions]", "*");
  if (typeof userId === "number" && userId > 0) {
    qs.set("filters[customerProfile][user][id][$eq]", String(userId));
  }
  const result = await fetchStrapiCollectionWithError(`${base}/api/orders?${qs.toString()}`, {
    headers,
    next: { revalidate: 0 },
  });
  const raw = Array.isArray(result.data) ? result.data : [];
  if (result.error || raw.length === 0) {
    return { data: raw, error: result.error, shipmentFallback: {} };
  }

  const ids = raw
    .map((o: any) => Number(o?.id))
    .filter((id: number) => Number.isFinite(id) && id > 0);
  if (ids.length === 0) {
    return { data: raw, error: result.error, shipmentFallback: {} };
  }

  const shipQs = new URLSearchParams();
  shipQs.set("pagination[pageSize]", String(Math.max(200, ids.length)));
  shipQs.set("populate[order]", "true");
  ids.forEach((id, i) => {
    shipQs.set(`filters[order][id][$in][${i}]`, String(id));
  });
  const shipRes = await fetchStrapiCollectionWithError(`${base}/api/shipments?${shipQs.toString()}`, {
    headers,
    next: { revalidate: 0 },
  });
  return {
    data: raw,
    error: result.error,
    shipmentFallback: shipmentSummaryByOrderIdFromStrapiList(shipRes.data),
  };
}

function mapRawOrdersToRows(
  raw: unknown[],
  shipmentFallback: Record<number, OrderShipmentSummary> = {}
): AdminOrderRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((order: any) => {
    const orderAttrs = withAttrs(order);
    const customerProfile = asRecord(orderAttrs?.customerProfile);
    const customerProfileNode = customerProfile?.data ?? customerProfile;
    const customerProfileAttrs = withAttrs(customerProfileNode);
    const userRel = asRecord(customerProfileAttrs?.user);
    const u = userRel?.data ?? userRel;
    const uRec = asRecord(u);
    const email =
      (withAttrs(u)?.email as string | undefined) || (uRec?.email as string | undefined) || "";
    const userId = typeof uRec?.id === "number" ? uRec.id : null;

    const itemsData = extractRelationMany(orderAttrs?.items);
    const items = Array.isArray(itemsData)
      ? itemsData.map((it: any, idx: number) => {
          const itAttrs = withAttrs(it);
          const variant = asRecord(itAttrs?.variant);
          const variantNode = variant?.data ?? variant;
          const variantAttrs = withAttrs(variantNode);
          const product = asRecord(variantAttrs?.product);
          const productNode = product?.data ?? product;
          const productAttrs = withAttrs(productNode);
          const pt =
            productAttrs?.title ??
            itAttrs?.title ??
            "";
          return {
            id: typeof it?.id === "number" ? it.id : idx,
            title: (itAttrs?.title as string) || "",
            sku: (itAttrs?.sku as string) || "",
            quantity: Number(itAttrs?.quantity) || 0,
            lineTotal: Number(itAttrs?.lineTotal) || 0,
            productTitle: typeof pt === "string" && pt ? pt : null,
          };
        })
      : [];

    return {
      id: order.id,
      orderNumber: String(order.attributes?.orderNumber ?? order.id),
      status: String(order.attributes?.status ?? ""),
      totalAmount: Number(order.attributes?.totalAmount) || 0,
      currency: (order.attributes?.currency as string) || "USD",
      createdAt: (order.attributes?.createdAt as string) || null,
      customerEmail: email,
      customerUserId: userId,
      items,
      shipment: parseStrapiOrderShipmentFromOrder(order) ?? shipmentFallback[Number(order.id)] ?? null,
      shippingAddress: parseStrapiShippingAddressFromOrder(order),
      payments: parseAdminOrderPaymentsFromOrder(order),
    };
  });
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: { userId?: string };
}) {
  const uid = searchParams?.userId ? Number(searchParams.userId) : NaN;
  const filterUserId = Number.isFinite(uid) && uid > 0 ? uid : undefined;
  const { data: ordersRaw, error: fetchError, shipmentFallback } = await getOrders(filterUserId);
  const rows = mapRawOrdersToRows(ordersRaw, shipmentFallback);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <AdminOrdersClient rows={rows} filterUserId={filterUserId} fetchError={fetchError} />
    </div>
  );
}
