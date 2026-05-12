/**
 * Stock helpers for storefront (Strapi product with populated variants → inventory).
 */

export type ProductStockUi =
  | { kind: "out" }
  | { kind: "single"; available: number }
  | { kind: "multi"; anyInStock: boolean; totalAvailable: number };

/** Normalize Strapi REST shapes for variant.inventory (populate, id-only, or flat). */
export function inventoryAttributesFromVariant(
  variantAttrs: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  const invRaw = variantAttrs?.inventory;
  if (invRaw == null || typeof invRaw !== "object") return undefined;

  const inv = invRaw as Record<string, unknown>;
  const data = inv.data;

  if (data === null || data === undefined) return undefined;

  if (Array.isArray(data)) {
    const first = data[0];
    if (first && typeof first === "object") {
      const row = first as Record<string, unknown>;
      if (row.attributes && typeof row.attributes === "object") {
        return row.attributes as Record<string, unknown>;
      }
      if ("onHand" in row || "available" in row) return row;
    }
    return undefined;
  }

  if (typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (d.attributes && typeof d.attributes === "object") {
      return d.attributes as Record<string, unknown>;
    }
    if ("onHand" in d || "available" in d) return d;
  }

  if (inv.attributes && typeof inv.attributes === "object") {
    return inv.attributes as Record<string, unknown>;
  }

  return undefined;
}

function variantAvailable(variantAttrs: Record<string, unknown> | undefined): number {
  const a = inventoryAttributesFromVariant(variantAttrs);
  if (!a) return 0;
  let n = a.available;
  if (n == null) n = a.onHand;
  return Math.max(0, Number(n) || 0);
}

export function productStockUi(attributes: Record<string, unknown> | undefined): ProductStockUi {
  const variants = (
    attributes?.variants as { data?: { id?: number; attributes?: Record<string, unknown> }[] } | undefined
  )?.data;
  if (!variants?.length) return { kind: "out" };

  const counts = variants.map((v) => variantAvailable(v.attributes));
  const total = counts.reduce((s, x) => s + x, 0);
  const anyInStock = counts.some((x) => x > 0);

  if (variants.length === 1) {
    return total > 0 ? { kind: "single", available: total } : { kind: "out" };
  }
  return { kind: "multi", anyInStock, totalAvailable: total };
}

/** Storefront stock badge copy */
export function stockBadgeLabel(ui: ProductStockUi): string {
  if (ui.kind === "out") return "Out of stock";
  if (ui.kind === "single") return `In stock (${ui.available})`;
  return ui.anyInStock ? `In stock (${ui.totalAvailable} total)` : "Out of stock";
}

export function stockBadgeClass(ui: ProductStockUi): string {
  if (ui.kind === "out") return "bg-red-50 text-red-800 border-red-200";
  if (ui.kind === "single" && ui.available <= 3) {
    return "bg-amber-50 text-amber-900 border-amber-200";
  }
  return "bg-emerald-50 text-emerald-900 border-emerald-200";
}
