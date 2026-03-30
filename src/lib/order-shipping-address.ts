/** Snapshot address on an order (Strapi `order.shippingAddress` relation). */

export type OrderShippingAddressSummary = {
  id: number;
  label: string | null;
  receiverName: string | null;
  phone: string | null;
  province: string | null;
  city: string | null;
  postalCode: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
};

export function formatOrderShippingAddressLines(a: OrderShippingAddressSummary): string[] {
  const lines: string[] = [];
  if (a.label?.trim()) lines.push(a.label.trim());
  if (a.receiverName?.trim()) lines.push(a.receiverName.trim());
  if (a.phone?.trim()) lines.push(a.phone.trim());
  const cityLine = [a.province, a.city].filter((s) => (s || "").trim()).join(", ");
  if (cityLine) lines.push(cityLine);
  if (a.postalCode?.trim()) lines.push(a.postalCode.trim());
  if (a.addressLine1?.trim()) lines.push(a.addressLine1.trim());
  if (a.addressLine2?.trim()) lines.push(a.addressLine2.trim());
  return lines;
}

export function parseStrapiShippingAddressFromOrder(order: unknown): OrderShippingAddressSummary | null {
  if (!order || typeof order !== "object") return null;
  const top = order as Record<string, unknown>;
  const attrs = (top.attributes as Record<string, unknown> | undefined) ?? top;
  const rel = attrs.shippingAddress as { data?: unknown } | undefined;
  const data = rel?.data;
  if (!data || typeof data !== "object") return null;
  const ent = data as { id?: number; attributes?: Record<string, unknown> };
  const id = typeof ent.id === "number" ? ent.id : 0;
  const a = ent.attributes ?? {};
  const summary: OrderShippingAddressSummary = {
    id,
    label: (a.label as string) || null,
    receiverName: (a.receiverName as string) || null,
    phone: (a.phone as string) || null,
    province: (a.province as string) || null,
    city: (a.city as string) || null,
    postalCode: (a.postalCode as string) || null,
    addressLine1: (a.addressLine1 as string) || null,
    addressLine2: (a.addressLine2 as string) || null,
  };
  if (formatOrderShippingAddressLines(summary).length === 0 && id <= 0) return null;
  return summary;
}
