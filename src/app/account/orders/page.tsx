import Link from "next/link";
import { cookies } from "next/headers";
import AccountOrdersClient from "components/specific_elements/account/account-orders-client";
import { STRAPI_JWT_COOKIE } from "config/constant";
import type { AccountOrderListRow } from "lib/account-portal-types";
import {
  parseStrapiOrderShipmentFromOrder,
  shipmentSummaryByOrderIdFromStrapiList,
  type OrderShipmentSummary,
} from "lib/order-shipment";
import {
  fetchStrapiCollectionWithError,
  strapiServerBaseUrl,
} from "lib/strapi-server-fetch";
import { parseStrapiShippingAddressFromOrder } from "lib/order-shipping-address";

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
  if (!rel) return [];
  const data = rel.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(input)) return input;
  return [];
}

function lineItemTitle(item: unknown): string {
  const attrs = withAttrs(item);
  const t = attrs?.title;
  return typeof t === "string" && t ? t : "Item";
}

function lineItemQuantity(item: unknown): number {
  const attrs = withAttrs(item);
  const q = Number(attrs?.quantity);
  return Number.isFinite(q) && q > 0 ? Math.floor(q) : 1;
}

function lineItemProductSlug(item: unknown): string | null {
  const attrs = withAttrs(item);
  const variantRaw = asRecord(attrs?.variant);
  const variantNode = variantRaw?.data ?? variantRaw;
  const variantAttrs = withAttrs(variantNode);
  const productRaw = asRecord(variantAttrs?.product);
  const productNode = productRaw?.data ?? productRaw;
  const productAttrs = withAttrs(productNode);
  const slug = productAttrs?.slug;
  return typeof slug === "string" && slug ? slug : null;
}

function mapAccountOrders(
  orders: unknown[],
  shipmentFallback: Record<number, OrderShipmentSummary> = {}
): AccountOrderListRow[] {
  if (!Array.isArray(orders)) return [];
  return orders.map((order: any) => {
    const orderAttrs = withAttrs(order);
    const items = extractRelationMany(orderAttrs?.items);
    const lineItems = Array.isArray(items)
      ? items.map((item: any) => ({
          id: item.id,
          title: lineItemTitle(item),
          quantity: lineItemQuantity(item),
          productSlug: lineItemProductSlug(item),
        }))
      : [];
    return {
      id: order.id,
      orderNumber: String(order.attributes?.orderNumber ?? order.id),
      status: String(order.attributes?.status ?? ""),
      totalAmount: Number(order.attributes?.totalAmount) || 0,
      currency: (order.attributes?.currency as string) || "USD",
      createdAt: (order.attributes?.createdAt as string) || null,
      lineItems,
      shipment: parseStrapiOrderShipmentFromOrder(order) ?? shipmentFallback[Number(order.id)] ?? null,
      shippingAddress: parseStrapiShippingAddressFromOrder(order),
    };
  });
}

async function getOrders(): Promise<{ rows: unknown[]; fetchError: string | null }> {
  const base = strapiServerBaseUrl().replace(/\/$/, "");
  if (!base) {
    return { rows: [], fetchError: "Content API URL is not configured." };
  }
  const jwt = cookies().get(STRAPI_JWT_COOKIE)?.value;
  const headers: HeadersInit = jwt ? { Authorization: `Bearer ${jwt}` } : {};
  const qs = new URLSearchParams();
  qs.set("locale", "en");
  qs.set("populate[items][populate][variant][populate][product]", "true");
  qs.set("populate[shippingAddress]", "true");
  // `*` deep-populates shipment.order and can circular-serialize to `{ data: { id } }` without attributes.
  qs.set("populate[shipment]", "true");
  qs.set("sort", "createdAt:desc");
  qs.set("pagination[pageSize]", "20");
  const { data, error } = await fetchStrapiCollectionWithError(
    `${base}/api/orders?${qs.toString()}`,
    { headers, next: { revalidate: 0 } }
  );
  if (error || !Array.isArray(data) || data.length === 0) {
    return { rows: data, fetchError: error };
  }

  const ids = data
    .map((o: any) => Number(o?.id))
    .filter((id: number) => Number.isFinite(id) && id > 0);
  if (ids.length === 0) return { rows: data, fetchError: error };

  const shipQs = new URLSearchParams();
  shipQs.set("pagination[pageSize]", String(Math.max(20, ids.length)));
  shipQs.set("populate[order]", "true");
  ids.forEach((id, i) => {
    shipQs.set(`filters[order][id][$in][${i}]`, String(id));
  });
  const { data: shipments } = await fetchStrapiCollectionWithError(
    `${base}/api/shipments?${shipQs.toString()}`,
    { headers, next: { revalidate: 0 } }
  );
  const fallback = shipmentSummaryByOrderIdFromStrapiList(shipments);
  const merged = data.map((o: any) => {
    const id = Number(o?.id);
    if (!Number.isFinite(id) || id <= 0) return o;
    if (parseStrapiOrderShipmentFromOrder(o)) return o;
    const sh = fallback[id];
    if (!sh) return o;
    return {
      ...o,
      attributes: {
        ...(o?.attributes || {}),
        shipment: { data: { id: 0, attributes: sh } },
      },
    };
  });
  return { rows: merged, fetchError: error };
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { checkout?: string | string[]; session_id?: string | string[] };
}) {
  const jwt = cookies().get(STRAPI_JWT_COOKIE)?.value;
  const { rows: ordersRaw, fetchError } = await getOrders();
  const rows = mapAccountOrders(ordersRaw);
  const checkoutParam = searchParams.checkout;
  const checkoutSuccess =
    checkoutParam === "success" || (Array.isArray(checkoutParam) && checkoutParam.includes("success"));
  const sid = searchParams.session_id;
  const stripeSessionId =
    typeof sid === "string" && sid.startsWith("cs_")
      ? sid
      : Array.isArray(sid)
        ? sid.find((s) => typeof s === "string" && s.startsWith("cs_")) ?? null
        : null;

  return (
    <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">My orders</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Order history and line items.{" "}
          <Link href="/shop" className="font-medium text-emerald-700 hover:underline">
            Continue shopping
          </Link>
        </p>
      </div>
      <AccountOrdersClient
        signedIn={Boolean(jwt)}
        rows={rows}
        checkoutSuccess={checkoutSuccess}
        stripeSessionId={stripeSessionId}
        fetchError={fetchError}
      />
    </main>
  );
}
