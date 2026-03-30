/** Strapi decimals may arrive as string or number. */
export function parseMoney(v: unknown): number {
  if (v == null) return 0;
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Active discount when compare-at is higher than current sale price. */
export function variantDiscountPercent(salePrice: number, compareAtPrice: number): number | null {
  if (!(compareAtPrice > salePrice && compareAtPrice > 0)) return null;
  return Math.round(((compareAtPrice - salePrice) / compareAtPrice) * 100);
}

export function formatMoney(amount: number, currency: string): string {
  const sym = currency === "IRR" ? "﷼" : "$";
  if (currency === "IRR") {
    return `${Math.round(amount).toLocaleString("fa-IR")} ${sym}`;
  }
  return `${sym}${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

/** First variant pricing for product cards (list / quick view). */
export function firstVariantPricingFromProduct(product: {
  attributes?: { variants?: { data?: { attributes?: Record<string, unknown> }[] } };
}): { price: number; compareAtPrice: number; currency: string } | null {
  const v = product.attributes?.variants?.data?.[0];
  if (!v?.attributes) return null;
  const a = v.attributes;
  return {
    price: parseMoney(a.price),
    compareAtPrice: parseMoney(a.compareAtPrice),
    currency: (a.currency as string) || "USD",
  };
}
