import type { AdminCustomerKpis, AdminCustomerRow } from "lib/admin-customers-model";
import {
  parseAdminOrderPaymentsFromOrder,
  type AdminOrderPaymentRow,
} from "lib/admin-order-row";
import {
  parseStrapiOrderShipmentFromOrder,
  shipmentSummaryByOrderIdFromStrapiList,
  type OrderShipmentSummary,
} from "lib/order-shipment";
import {
  parseStrapiShippingAddressFromOrder,
  type OrderShippingAddressSummary,
} from "lib/order-shipping-address";
import { adminStrapiFetchHeaders } from "lib/admin-strapi";
import { entitledProductRefsFromOrders } from "lib/product-tutorial-customer";
import { fetchStrapiCollection, fetchStrapiJson } from "lib/strapi-server-fetch";
import { getStrapiOrigin } from "lib/strapi-origin";

/** Order statuses that count toward revenue / “spent”. */
export const ORDER_REVENUE_STATUSES = new Set([
  "paid",
  "processing",
  "shipped",
  "delivered",
]);

export type { AdminCustomerKpis, AdminCustomerRow } from "lib/admin-customers-model";

type StrapiUser = {
  id: number;
  username?: string;
  email?: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

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

function normalizeUsersPayload(payload: unknown): StrapiUser[] {
  if (Array.isArray(payload)) {
    return payload.filter((u): u is StrapiUser => u && typeof u.id === "number");
  }
  if (payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)) {
    const data = (payload as { data: StrapiUser[] }).data;
    return data.filter((u) => u && typeof u.id === "number");
  }
  return [];
}

function normalizeOneUserPayload(payload: unknown): StrapiUser | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (typeof p.id === "number") {
    return p as unknown as StrapiUser;
  }
  const data = p.data as Record<string, unknown> | undefined;
  if (data && typeof data.id === "number") {
    const a = (data.attributes as Record<string, unknown>) || {};
    return {
      id: data.id,
      username: a.username as string | undefined,
      email: a.email as string | undefined,
      confirmed: a.confirmed as boolean | undefined,
      blocked: a.blocked as boolean | undefined,
      createdAt: a.createdAt as string | undefined,
      updatedAt: a.updatedAt as string | undefined,
    };
  }
  return null;
}

function maxIso(a: string | null, b: string | undefined | null): string | null {
  if (!a) return b ?? null;
  if (!b) return a;
  return new Date(b) > new Date(a) ? b : a;
}

export async function loadAdminCustomersData(): Promise<{
  rows: AdminCustomerRow[];
  kpis: AdminCustomerKpis;
}> {
  const base = (getStrapiOrigin() || process.env.NEXT_PUBLIC_BASE_API_URL_SERVER || "").replace(/\/$/, "");
  const headers = await adminStrapiFetchHeaders();

  const [usersPayload, profiles, orders] = await Promise.all([
    fetchStrapiJson<unknown>(
      `${base}/api/users?populate=role`,
      { headers },
      []
    ),
    fetchStrapiCollection(`${base}/api/customer-profiles?pagination[pageSize]=500&populate=user`, {
      headers,
    }),
    fetchStrapiCollection(
      `${base}/api/orders?pagination[pageSize]=500&sort=createdAt:desc&populate[customerProfile][populate]=user`,
      { headers }
    ),
  ]);

  const users = normalizeUsersPayload(usersPayload);

  const profileByUserId = new Map<
    number,
    { profileId: number; fullName: string; phoneNumber: string | null }
  >();
  for (const p of profiles) {
    const uid = p.attributes?.user?.data?.id;
    if (typeof uid !== "number") continue;
    profileByUserId.set(uid, {
      profileId: p.id,
      fullName: (p.attributes?.fullName as string)?.trim() || "",
      phoneNumber: (p.attributes?.phoneNumber as string) || null,
    });
  }

  type Agg = {
    totalOrders: number;
    totalSpent: number;
    lastActivityAt: string | null;
    lastCurrency: string;
  };
  const aggByUser = new Map<number, Agg>();

  for (const order of orders) {
    const uid = order.attributes?.customerProfile?.data?.attributes?.user?.data?.id;
    if (typeof uid !== "number") continue;

    const status = order.attributes?.status as string | undefined;
    const createdAt = order.attributes?.createdAt as string | undefined;
    const currency = (order.attributes?.currency as string) || "USD";
    const amount = Number(order.attributes?.totalAmount) || 0;

    let agg = aggByUser.get(uid);
    if (!agg) {
      agg = { totalOrders: 0, totalSpent: 0, lastActivityAt: null, lastCurrency: currency };
      aggByUser.set(uid, agg);
    }

    agg.totalOrders += 1;
    if (status && ORDER_REVENUE_STATUSES.has(status)) {
      agg.totalSpent += amount;
      agg.lastCurrency = currency;
    }
    agg.lastActivityAt = maxIso(agg.lastActivityAt, createdAt);
  }

  const spentValues = Array.from(aggByUser.values())
    .map((a) => a.totalSpent)
    .filter((s) => s > 0)
    .sort((x, y) => x - y);
  const p75Index = Math.floor(Math.max(0, spentValues.length - 1) * 0.75);
  const p75 = spentValues.length ? spentValues[p75Index] ?? 0 : 0;

  const rows: AdminCustomerRow[] = users.map((u) => {
    const prof = profileByUserId.get(u.id);
    const agg = aggByUser.get(u.id);
    const name =
      prof?.fullName?.trim() ||
      (u.username?.trim() ? u.username : "") ||
      u.email?.split("@")[0] ||
      `User ${u.id}`;

    const totalOrders = agg?.totalOrders ?? 0;
    const totalSpent = agg?.totalSpent ?? 0;
    const currency = agg?.lastCurrency || "USD";
    const lastActivityAt = maxIso(agg?.lastActivityAt ?? null, u.updatedAt ?? u.createdAt);

    return {
      id: u.id,
      name,
      email: u.email ?? "",
      totalOrders,
      totalSpent,
      currency,
      lastActivityAt,
      confirmed: Boolean(u.confirmed),
      blocked: Boolean(u.blocked),
      createdAt: u.createdAt ?? null,
      profileId: prof?.profileId ?? null,
      phoneNumber: prof?.phoneNumber ?? null,
      highSpender: totalSpent > 0 && totalSpent >= p75,
    };
  });

  const monthAgo = new Date();
  monthAgo.setUTCDate(1);
  monthAgo.setUTCHours(0, 0, 0, 0);
  const newThisMonth = rows.filter((r) => {
    if (!r.createdAt) return false;
    return new Date(r.createdAt) >= monthAgo;
  }).length;

  const activeUsers = rows.filter((r) => r.confirmed && !r.blocked).length;

  let revenueSum = 0;
  let revenueCount = 0;
  let revenueCurrency = "USD";
  for (const order of orders) {
    const st = order.attributes?.status as string | undefined;
    if (!st || !ORDER_REVENUE_STATUSES.has(st)) continue;
    revenueSum += Number(order.attributes?.totalAmount) || 0;
    revenueCount += 1;
    revenueCurrency = (order.attributes?.currency as string) || revenueCurrency;
  }
  const avgOrderValue = revenueCount > 0 ? revenueSum / revenueCount : 0;

  const kpis: AdminCustomerKpis = {
    totalCustomers: rows.length,
    activeUsers,
    newThisMonth,
    avgOrderValue,
    avgOrderCurrency: revenueCurrency,
  };

  return { rows, kpis };
}

export type AdminCustomerProfileOrder = {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string | null;
  timeline: unknown;
  items: {
    title: string;
    sku: string;
    quantity: number;
    lineTotal: number;
    productTitle: string | null;
  }[];
  shipment: OrderShipmentSummary | null;
  shippingAddress: OrderShippingAddressSummary | null;
  payments: AdminOrderPaymentRow[];
};

export type AdminCustomerAddress = {
  id: number;
  label: string | null;
  receiverName: string | null;
  phone: string | null;
  province: string | null;
  city: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  postalCode: string | null;
};

/** Product tutorials this customer is entitled to (from qualifying orders). */
export type AdminCustomerTutorialSummary = {
  productId: number;
  slug: string;
  title: string;
};

export type AdminCustomerProfileData = {
  user: {
    id: number;
    username: string;
    email: string;
    confirmed: boolean;
    blocked: boolean;
    createdAt: string | null;
    updatedAt: string | null;
  } | null;
  profile: {
    id: number;
    fullName: string;
    phoneNumber: string | null;
    loyaltyPoints: number;
  } | null;
  orders: AdminCustomerProfileOrder[];
  totals: { orderCount: number; totalSpent: number; currency: string };
  addresses: AdminCustomerAddress[];
  tutorials: AdminCustomerTutorialSummary[];
};

function mapAddressRow(raw: { id?: number; attributes?: Record<string, unknown> }): AdminCustomerAddress {
  const a = raw.attributes ?? {};
  return {
    id: typeof raw.id === "number" ? raw.id : 0,
    label: (a.label as string) || null,
    receiverName: (a.receiverName as string) || null,
    phone: (a.phone as string) || null,
    province: (a.province as string) || null,
    city: (a.city as string) || null,
    addressLine1: (a.addressLine1 as string) || null,
    addressLine2: (a.addressLine2 as string) || null,
    postalCode: (a.postalCode as string) || null,
  };
}

async function loadAdminTutorialSummariesForOrders(
  rawOrders: unknown[],
  base: string,
  headers: HeadersInit
): Promise<AdminCustomerTutorialSummary[]> {
  const entitled = entitledProductRefsFromOrders(rawOrders);
  if (entitled.ids.size === 0 && entitled.slugs.size === 0) return [];

  const rows = await fetchStrapiCollection(
    `${base}/api/product-tutorials?locale=en&pagination[pageSize]=200&populate[product]=true`,
    { headers }
  );

  const summaries: AdminCustomerTutorialSummary[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const attrs = (row as { attributes?: Record<string, unknown> }).attributes;
    const product = attrs?.product as { data?: unknown } | undefined;
    const pData = product?.data as {
      id?: number;
      attributes?: { slug?: string; title?: string };
    } | undefined;
    const pid = pData?.id;
    const slug = pData?.attributes?.slug;
    const slugOk = typeof slug === "string" && slug && entitled.slugs.has(slug);
    const idOk = typeof pid === "number" && entitled.ids.has(pid);
    if (!slugOk && !idOk) continue;
    if (typeof slug !== "string" || !slug || typeof pid !== "number") continue;
    const title = pData?.attributes?.title;
    summaries.push({
      productId: pid,
      slug,
      title: typeof title === "string" && title ? title : slug,
    });
  }

  const seen = new Set<string>();
  return summaries.filter((s) => {
    if (seen.has(s.slug)) return false;
    seen.add(s.slug);
    return true;
  });
}

export async function loadAdminCustomerProfile(userId: number): Promise<AdminCustomerProfileData | null> {
  const base = (getStrapiOrigin() || process.env.NEXT_PUBLIC_BASE_API_URL_SERVER || "").replace(/\/$/, "");
  const headers = await adminStrapiFetchHeaders();

  const [userJson, addressesRaw] = await Promise.all([
    fetchStrapiJson<unknown>(`${base}/api/users/${userId}?populate=role`, { headers }, null),
    fetchStrapiCollection(
      `${base}/api/addresses?filters[user][id][$eq]=${userId}&pagination[pageSize]=50&sort=updatedAt:desc`,
      { headers }
    ),
  ]);

  const u = normalizeOneUserPayload(userJson);
  if (!u) return null;

  const addresses: AdminCustomerAddress[] = Array.isArray(addressesRaw)
    ? addressesRaw
        .filter((row): row is { id: number; attributes?: Record<string, unknown> } => typeof row?.id === "number")
        .map(mapAddressRow)
    : [];

  const profiles = await fetchStrapiCollection(
    `${base}/api/customer-profiles?filters[user][id][$eq]=${userId}&pagination[pageSize]=1&populate=user`,
    { headers }
  );
  const prof = profiles[0];
  const profileId = prof?.id;

  let orders: any[] = [];
  let shipmentFallbackByOrderId: Record<number, OrderShipmentSummary> = {};
  if (typeof profileId === "number") {
    const qs = new URLSearchParams();
    qs.set("filters[customerProfile][id][$eq]", String(profileId));
    qs.set("pagination[pageSize]", "100");
    qs.set("sort", "createdAt:desc");
    qs.set("populate[items][populate][variant][populate]", "product");
    qs.set("populate[shippingAddress]", "true");
    qs.set("populate[shipment]", "true");
    qs.set("populate[paymentTransactions]", "*");
    orders = await fetchStrapiCollection(`${base}/api/orders?${qs.toString()}`, {
      headers,
      next: { revalidate: 0 },
    });

    const ids = orders
      .map((o: any) => Number(o?.id))
      .filter((id: number) => Number.isFinite(id) && id > 0);
    if (ids.length > 0) {
      const shipQs = new URLSearchParams();
      shipQs.set("pagination[pageSize]", String(Math.max(100, ids.length)));
      shipQs.set("populate[order]", "true");
      ids.forEach((id, i) => {
        shipQs.set(`filters[order][id][$in][${i}]`, String(id));
      });
      const shipments = await fetchStrapiCollection(`${base}/api/shipments?${shipQs.toString()}`, {
        headers,
        next: { revalidate: 0 },
      });
      shipmentFallbackByOrderId = shipmentSummaryByOrderIdFromStrapiList(shipments);
    }
  }

  const tutorials =
    orders.length > 0 ? await loadAdminTutorialSummariesForOrders(orders, base, headers) : [];

  let totalSpent = 0;
  let currency = "USD";
  const mappedOrders: AdminCustomerProfileOrder[] = orders.map((o) => {
    const orderAttrs = withAttrs(o);
    const st = orderAttrs?.status as string | undefined;
    const amt = Number(orderAttrs?.totalAmount) || 0;
    if (st && ORDER_REVENUE_STATUSES.has(st)) {
      totalSpent += amt;
      currency = (orderAttrs?.currency as string) || currency;
    }
    const itemsData = extractRelationMany(orderAttrs?.items);
    const items = Array.isArray(itemsData)
      ? itemsData.map((it: any) => {
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
            title: (itAttrs?.title as string) || "",
            sku: (itAttrs?.sku as string) || "",
            quantity: Number(itAttrs?.quantity) || 0,
            lineTotal: Number(itAttrs?.lineTotal) || 0,
            productTitle: typeof pt === "string" && pt ? pt : null,
          };
        })
      : [];

    return {
      id: o.id,
      orderNumber: String(orderAttrs?.orderNumber ?? o.id),
      status: String(orderAttrs?.status ?? ""),
      totalAmount: amt,
      currency: (orderAttrs?.currency as string) || "USD",
      createdAt: (orderAttrs?.createdAt as string) || null,
      timeline: orderAttrs?.timeline ?? null,
      items,
      shipment:
        parseStrapiOrderShipmentFromOrder(o) ?? shipmentFallbackByOrderId[Number(o.id)] ?? null,
      shippingAddress: parseStrapiShippingAddressFromOrder(o),
      payments: parseAdminOrderPaymentsFromOrder(o),
    };
  });

  const profile =
    prof && typeof prof.id === "number"
      ? {
          id: prof.id,
          fullName: String(prof.attributes?.fullName ?? "").trim() || u.email || "Customer",
          phoneNumber: (prof.attributes?.phoneNumber as string) || null,
          loyaltyPoints: Number(prof.attributes?.loyaltyPoints) || 0,
        }
      : null;

  return {
    user: {
      id: u.id,
      username: u.username ?? "",
      email: u.email ?? "",
      confirmed: Boolean(u.confirmed),
      blocked: Boolean(u.blocked),
      createdAt: u.createdAt ?? null,
      updatedAt: u.updatedAt ?? null,
    },
    profile,
    orders: mappedOrders,
    totals: {
      orderCount: mappedOrders.length,
      totalSpent,
      currency,
    },
    addresses,
    tutorials,
  };
}
