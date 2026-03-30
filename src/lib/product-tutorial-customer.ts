import { strapiRequest } from "lib/shop-api";
import { getStrapiOrigin } from "lib/strapi-origin";
import { blocksToPublicPieces, type TutorialPublicPiece } from "lib/tutorial-blocks";

const ENTITLED_ORDER_STATUSES = new Set([
  "paid",
  "processing",
  "shipped",
  "delivered",
]);

/**
 * Strapi 4: `populate[blocks][populate]=*` does not load `file` / `media` inside dynamic-zone
 * components, so customers get empty tutorial bodies. Populate each component type explicitly.
 * @see https://docs.strapi.io/dev-docs/api/rest/guides/intro#populate-dynamic-zones
 */
function appendProductTutorialBlocksPopulate(qs: URLSearchParams): void {
  qs.set("populate[blocks][on][shared.rich-text][fields][0]", "body");
  qs.set("populate[blocks][on][shared.media][populate][file]", "true");
  qs.set("populate[blocks][on][shared.video-embed][fields][0]", "url");
  qs.set("populate[blocks][on][tutorial.video-file][populate][media]", "true");
}

async function fetchFirstProductTutorialRow(productId: number, productSlug: string): Promise<unknown | null> {
  const buildQs = (filterKey: string, filterVal: string): URLSearchParams => {
    const q = new URLSearchParams();
    q.set("pagination[pageSize]", "1");
    q.set(filterKey, filterVal);
    appendProductTutorialBlocksPopulate(q);
    return q;
  };

  const attempts = [
    buildQs("filters[product][id][$eq]", String(productId)),
    buildQs("filters[product][slug][$eq]", productSlug),
  ];

  for (const qs of attempts) {
    try {
      const tutorialPayload = (await strapiRequest(
        `/api/product-tutorials?${qs.toString()}`
      )) as { data?: unknown[] };
      const row = Array.isArray(tutorialPayload?.data) ? tutorialPayload.data[0] : null;
      if (row) return row;
    } catch {
      /* try next filter */
    }
  }
  return null;
}

function toNumericId(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  return null;
}

export async function fetchCustomerOrders(strapiBase: string, jwt: string): Promise<unknown[]> {
  const qs = new URLSearchParams();
  qs.set("populate[items][populate][variant][populate][product]", "true");
  qs.set("pagination[pageSize]", "100");
  qs.set("sort", "createdAt:desc");
  const res = await fetch(`${strapiBase.replace(/\/$/, "")}/api/orders?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${jwt}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const payload = await res.json().catch(() => ({}));
  return Array.isArray(payload?.data) ? payload.data : [];
}

function variantProductFromOrderItem(item: unknown): { id: number; slug?: string; title?: string } | null {
  if (!item || typeof item !== "object") return null;
  const attrs = (item as { attributes?: Record<string, unknown> }).attributes;
  const variant = attrs?.variant as { data?: unknown } | undefined;
  const vData = variant?.data as
    | { id?: unknown; attributes?: Record<string, unknown> }
    | undefined;
  if (!vData || typeof vData !== "object") return null;
  const product = vData.attributes?.product as { data?: unknown } | undefined;
  const pData = product?.data as { id?: unknown; attributes?: Record<string, unknown> } | undefined;
  const pid = pData ? toNumericId(pData.id) : null;
  if (pid == null || !pData) return null;
  const pa = pData.attributes;
  return {
    id: pid,
    slug: typeof pa?.slug === "string" ? pa.slug : undefined,
    title: typeof pa?.title === "string" ? pa.title : undefined,
  };
}

/** Variant ids from paid (etc.) orders — used when nested product populate is missing. */
function collectPaidOrderVariantIds(orders: unknown[]): number[] {
  const out: number[] = [];
  for (const order of orders) {
    if (!order || typeof order !== "object") continue;
    const st = (order as { attributes?: { status?: string } }).attributes?.status;
    if (!st || !ENTITLED_ORDER_STATUSES.has(st)) continue;
    const items = (order as { attributes?: { items?: { data?: unknown[] } } }).attributes?.items?.data;
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const attrs = (item as { attributes?: Record<string, unknown> }).attributes;
      const variant = attrs?.variant as { data?: { id?: unknown } } | undefined;
      const vid = variant?.data?.id != null ? toNumericId(variant.data.id) : null;
      if (vid != null) out.push(vid);
    }
  }
  return out;
}

function addProductNodeToEntitled(
  node: { id?: unknown; attributes?: Record<string, unknown> } | null | undefined,
  entitled: EntitledProductRefs,
  visited: Set<number>
): void {
  if (!node || typeof node !== "object") return;
  const pid = toNumericId(node.id);
  if (pid != null) {
    if (visited.has(pid)) return;
    visited.add(pid);
    entitled.ids.add(pid);
  }
  const attrs = node.attributes;
  const slug = attrs?.slug;
  if (typeof slug === "string" && slug.trim()) entitled.slugs.add(slug.trim());
  const locs = attrs?.localizations as { data?: unknown[] } | undefined;
  const locRows = Array.isArray(locs?.data) ? locs.data : [];
  for (const row of locRows) {
    if (row && typeof row === "object") {
      addProductNodeToEntitled(
        row as { id?: unknown; attributes?: Record<string, unknown> },
        entitled,
        visited
      );
    }
  }
}

/**
 * Strapi sometimes omits nested `product` on order line items (draft product, locale, permissions).
 * Resolve variant → product (+ i18n localizations) with the server API token so en tutorials match.
 */
async function enrichEntitledFromOrderVariants(variantIds: number[], entitled: EntitledProductRefs): Promise<void> {
  const unique = Array.from(new Set(variantIds.filter((id) => id > 0)));
  await Promise.all(
    unique.map(async (variantId) => {
      try {
        const payload = (await strapiRequest(
          `/api/product-variants/${variantId}?populate[product][populate]=localizations`
        )) as {
          data?: { attributes?: Record<string, unknown> };
        };
        const product = payload?.data?.attributes?.product as { data?: unknown } | undefined;
        const pData = product?.data as
          | { id?: unknown; attributes?: Record<string, unknown> }
          | undefined;
        addProductNodeToEntitled(pData, entitled, new Set());
      } catch {
        /* non-fatal */
      }
    })
  );
}

export async function resolveEntitledProductRefs(strapiJwt: string): Promise<EntitledProductRefs> {
  const strapiBase = getStrapiOrigin();
  if (!strapiBase) return { ids: new Set(), slugs: new Set() };

  const orders = await fetchCustomerOrders(strapiBase, strapiJwt);
  const entitled = entitledProductRefsFromOrders(orders);
  const variantIds = collectPaidOrderVariantIds(orders);
  await enrichEntitledFromOrderVariants(variantIds, entitled);
  return entitled;
}

export type EntitledProductRefs = { ids: Set<number>; slugs: Set<string> };

/**
 * Product ids + slugs from qualifying orders. Slugs fix i18n: variant may point at a non-`en`
 * product id while tutorials/products may be loaded in another locale.
 */
export function entitledProductRefsFromOrders(orders: unknown[]): EntitledProductRefs {
  const ids = new Set<number>();
  const slugs = new Set<string>();
  for (const order of orders) {
    if (!order || typeof order !== "object") continue;
    const st = (order as { attributes?: { status?: string } }).attributes?.status;
    if (!st || !ENTITLED_ORDER_STATUSES.has(st)) continue;
    const items = (order as { attributes?: { items?: { data?: unknown[] } } }).attributes?.items
      ?.data;
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      const p = variantProductFromOrderItem(item);
      if (p) {
        ids.add(p.id);
        if (p.slug) slugs.add(p.slug);
      }
    }
  }
  return { ids, slugs };
}

/** @deprecated use entitledProductRefsFromOrders */
export function entitledProductIdsFromOrders(orders: unknown[]): Set<number> {
  return entitledProductRefsFromOrders(orders).ids;
}

export type CustomerTutorialSummary = {
  productId: number;
  slug: string;
  title: string;
};

/** List tutorials for products the user purchased (uses API token for tutorial + product data). */
export async function listCustomerTutorials(
  strapiJwt: string
): Promise<CustomerTutorialSummary[]> {
  const strapiBase = getStrapiOrigin();
  if (!strapiBase) return [];

  const entitled = await resolveEntitledProductRefs(strapiJwt);
  if (entitled.ids.size === 0 && entitled.slugs.size === 0) return [];

  let tutorialsPayload: { data?: unknown[] };
  try {
    tutorialsPayload = (await strapiRequest(
      `/api/product-tutorials?pagination[pageSize]=200&populate[product]=true`
    )) as { data?: unknown[] };
  } catch {
    return [];
  }

  const rows = Array.isArray(tutorialsPayload?.data) ? tutorialsPayload.data : [];
  const summaries: CustomerTutorialSummary[] = [];

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const attrs = (row as { attributes?: Record<string, unknown> }).attributes;
    const product = attrs?.product as { data?: unknown } | undefined;
    const pData = product?.data as {
      id?: number;
      attributes?: { slug?: string; title?: string };
    } | undefined;
    const pid = pData?.id != null ? toNumericId(pData.id) : null;
    const slug = pData?.attributes?.slug;
    const slugOk = typeof slug === "string" && slug && entitled.slugs.has(slug);
    const idOk = pid != null && entitled.ids.has(pid);
    if (!slugOk && !idOk) continue;
    if (typeof slug !== "string" || !slug || pid == null) continue;
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

export type CustomerTutorialDetail = {
  slug: string;
  title: string;
  pieces: TutorialPublicPiece[];
};

export async function getCustomerTutorialBySlug(
  strapiJwt: string,
  slug: string
): Promise<{ ok: true; data: CustomerTutorialDetail } | { ok: false; reason: "unauthorized" | "forbidden" | "not_found" }> {
  const strapiBase = getStrapiOrigin();
  if (!strapiBase) return { ok: false, reason: "not_found" };

  const entitled = await resolveEntitledProductRefs(strapiJwt);

  let productPayload: { data?: { id?: unknown; attributes?: { title?: string; slug?: string } }[] };
  try {
    productPayload = (await strapiRequest(
      `/api/products?filters[slug][$eq]=${encodeURIComponent(
        slug
      )}&pagination[pageSize]=1`
    )) as typeof productPayload;
  } catch {
    return { ok: false, reason: "not_found" };
  }

  const pRow = productPayload?.data?.[0];
  const productId = pRow ? toNumericId(pRow.id) : null;
  if (!pRow || productId == null) {
    return { ok: false, reason: "not_found" };
  }

  const slugEntitled = entitled.slugs.has(slug);
  const idEntitled = entitled.ids.has(productId);
  if (!slugEntitled && !idEntitled) {
    return { ok: false, reason: "forbidden" };
  }

  const title =
    typeof pRow.attributes?.title === "string" ? pRow.attributes.title : slug;

  let tRow: unknown = null;
  try {
    tRow = await fetchFirstProductTutorialRow(productId, slug);
  } catch {
    tRow = null;
  }

  const blocks =
    tRow && typeof tRow === "object"
      ? (tRow as { attributes?: { blocks?: unknown } }).attributes?.blocks
      : undefined;

  const pieces = blocksToPublicPieces(blocks, strapiBase);

  return {
    ok: true,
    data: { slug, title, pieces },
  };
}
