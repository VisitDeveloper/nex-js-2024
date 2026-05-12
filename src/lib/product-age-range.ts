/** Matches Strapi `product.ageRange` enumeration values. */
export const PRODUCT_AGE_RANGE_KEYS = [
  "age-7-10",
  "age-11-13",
  "age-14-16",
  "age-17-20",
] as const;

export type ProductAgeRangeKey = (typeof PRODUCT_AGE_RANGE_KEYS)[number];

export const PRODUCT_AGE_RANGE_LABELS: Record<ProductAgeRangeKey, string> = {
  "age-7-10": "Ages 7–10",
  "age-11-13": "Ages 11–13",
  "age-14-16": "Ages 14–16",
  "age-17-20": "Ages 17–20",
};

export function isProductAgeRangeKey(v: string | null | undefined): v is ProductAgeRangeKey {
  return v != null && (PRODUCT_AGE_RANGE_KEYS as readonly string[]).includes(v);
}

export function productAgeRangeLabel(v: string | null | undefined): string | null {
  if (!v || !isProductAgeRangeKey(v)) return null;
  return PRODUCT_AGE_RANGE_LABELS[v];
}
