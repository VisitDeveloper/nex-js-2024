/** Strapi `product.productType` enum values */
export const PRODUCT_TYPE_KEYS = [
  "robot",
  "robot-part",
  "three-d-print",
  "accessory",
] as const;

export type ProductTypeKey = (typeof PRODUCT_TYPE_KEYS)[number];

export const PRODUCT_TYPE_LABELS: Record<ProductTypeKey, string> = {
  robot: "Robot",
  "robot-part": "Robot part",
  "three-d-print": "3D print",
  accessory: "Accessory",
};

export function productTypeLabel(key: string | undefined | null): string | null {
  if (!key) return null;
  return (PRODUCT_TYPE_LABELS as Record<string, string>)[key] ?? null;
}

export function isProductTypeKey(v: string): v is ProductTypeKey {
  return (PRODUCT_TYPE_KEYS as readonly string[]).includes(v);
}
