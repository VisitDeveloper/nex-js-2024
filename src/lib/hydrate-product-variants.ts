/**
 * When nested populate product → variants fails (Strapi 4 quirks, proxies), load variants
 * in a second request and attach them in the shape the storefront / admin mappers expect.
 */

export function attachVariantsFromMap(products: unknown[], byProductId: Map<number, unknown[]>): void {
  if (!Array.isArray(products)) return;
  for (const p of products) {
    if (!p || typeof p !== "object") continue;
    const row = p as {
      id?: number;
      attributes?: { variants?: { data?: unknown[] } };
    };
    if (typeof row.id !== "number" || !row.attributes) continue;
    const existing = row.attributes.variants?.data;
    if (Array.isArray(existing) && existing.length > 0) continue;
    const list = byProductId.get(row.id);
    if (list?.length) {
      row.attributes.variants = { data: list };
    }
  }
}

function productIdFromVariantRow(row: unknown): number | undefined {
  if (!row || typeof row !== "object") return undefined;
  const r = row as {
    attributes?: {
      product?: unknown;
    };
  };
  const prod = r.attributes?.product;
  if (prod && typeof prod === "object" && prod !== null) {
    const d = (prod as { data?: { id?: unknown } }).data;
    if (d && typeof d.id === "number") return d.id;
  }
  return undefined;
}

/** All variants (paginated), grouped by localized product id. */
export async function fetchVariantsGroupedByProductId(
  baseUrl: string,
  init?: RequestInit
): Promise<Map<number, unknown[]>> {
  const map = new Map<number, unknown[]>();
  const origin = baseUrl.replace(/\/$/, "");
  if (!origin) return map;

  const pageSize = 100;
  const maxPages = 50;
  let page = 1;
  let pageCount = 1;

  try {
    while (page <= pageCount && page <= maxPages) {
      const qs = new URLSearchParams();
      qs.set("pagination[pageSize]", String(pageSize));
      qs.set("pagination[page]", String(page));
      qs.set("populate[inventory]", "true");
      qs.set("populate[product]", "true");
      const url = `${origin}/api/product-variants?${qs.toString()}`;
      const res = await fetch(url, { cache: "no-store", ...init });
      if (!res.ok) break;
      const json = (await res.json().catch(() => ({}))) as {
        data?: unknown[];
        meta?: { pagination?: { pageCount?: number } };
      };
      const rows = Array.isArray(json?.data) ? json.data : [];
      const pc = json?.meta?.pagination?.pageCount;
      if (typeof pc === "number" && pc > 0) {
        pageCount = pc;
      }
      for (const row of rows) {
        const pid = productIdFromVariantRow(row);
        if (typeof pid !== "number") continue;
        if (!map.has(pid)) map.set(pid, []);
        map.get(pid)!.push(row);
      }
      if (rows.length < pageSize) break;
      page += 1;
    }
  } catch {
    /* ignore */
  }

  return map;
}

/** Variants for one product (detail page). */
export async function fetchVariantsForProductId(
  baseUrl: string,
  productId: number,
  init?: RequestInit
): Promise<unknown[]> {
  const origin = baseUrl.replace(/\/$/, "");
  if (!origin) return [];
  const qs = new URLSearchParams();
  qs.set("filters[product][id][$eq]", String(productId));
  qs.set("populate[inventory]", "true");
  qs.set("pagination[pageSize]", "100");
  try {
    const res = await fetch(`${origin}/api/product-variants?${qs.toString()}`, {
      cache: "no-store",
      ...init,
    });
    if (!res.ok) return [];
    const json = (await res.json().catch(() => ({}))) as { data?: unknown[] };
    return Array.isArray(json?.data) ? json.data : [];
  } catch {
    return [];
  }
}
