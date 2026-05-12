/** Strapi order → shipment relation (populate[shipment]). */

export type OrderShipmentSummary = {
  carrier: string | null;
  trackingCode: string | null;
  status: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
};

function normalizeShipmentFields(source: Record<string, unknown> | null | undefined): OrderShipmentSummary | null {
  if (!source || typeof source !== "object") return null;
  const carrier = typeof source.carrier === "string" && source.carrier.trim() ? source.carrier.trim() : null;
  const trackingCode =
    typeof source.trackingCode === "string" && source.trackingCode.trim()
      ? source.trackingCode.trim()
      : null;
  const status = typeof source.status === "string" && source.status ? source.status : null;
  const shippedAt = typeof source.shippedAt === "string" ? source.shippedAt : null;
  const deliveredAt = typeof source.deliveredAt === "string" ? source.deliveredAt : null;
  if (!carrier && !trackingCode && !status && !shippedAt && !deliveredAt) return null;
  return { carrier, trackingCode, status, shippedAt, deliveredAt };
}

/** REST list/detail: `attributes.shipment` → various Strapi 4 shapes. */
export function parseStrapiOrderShipmentFromOrder(order: unknown): OrderShipmentSummary | null {
  if (!order || typeof order !== "object") return null;
  const root = order as { attributes?: Record<string, unknown> } & Record<string, unknown>;
  const attrs = root.attributes;
  const ship = attrs?.shipment ?? root.shipment;
  if (!ship || typeof ship !== "object") return null;

  const s = ship as { data?: unknown } & Record<string, unknown>;
  let node: unknown = s.data;

  // Direct attributes on relation object (non-standard / flattened)
  if (node == null && ("status" in s || "carrier" in s || "trackingCode" in s)) {
    return normalizeShipmentFields(s as Record<string, unknown>);
  }

  if (Array.isArray(node)) {
    node = node[0];
  }
  if (!node || typeof node !== "object") return null;

  const n = node as { attributes?: Record<string, unknown> } & Record<string, unknown>;
  const flat =
    n.attributes && typeof n.attributes === "object"
      ? n.attributes
      : (n as Record<string, unknown>);
  return normalizeShipmentFields(flat);
}

/** `entityService` / custom controller body `{ data: row }` (flat or `attributes`). */
/** True when summary is worth showing in tables / clearing optimistic overlay after refresh. */
export function orderShipmentHasDisplayData(s: OrderShipmentSummary | null | undefined): boolean {
  if (!s) return false;
  return Boolean(s.trackingCode || s.carrier || s.status || s.shippedAt || s.deliveredAt);
}

export function orderShipmentSummaryFromStrapiEntity(data: unknown): OrderShipmentSummary | null {
  if (!data || typeof data !== "object") return null;
  const d = data as { attributes?: Record<string, unknown> } & Record<string, unknown>;
  const source =
    d.attributes && typeof d.attributes === "object"
      ? d.attributes
      : (d as Record<string, unknown>);
  return normalizeShipmentFields(source);
}

/** Shipment list endpoint (`/api/shipments`) → map by `order.id` for fallback joins. */
export function shipmentSummaryByOrderIdFromStrapiList(
  rows: unknown[]
): Record<number, OrderShipmentSummary> {
  const out: Record<number, OrderShipmentSummary> = {};
  if (!Array.isArray(rows)) return out;

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const r = row as { attributes?: Record<string, unknown> };
    const attrs = r.attributes;
    if (!attrs || typeof attrs !== "object") continue;

    const rel = attrs.order as
      | { data?: { id?: unknown } | null; id?: unknown }
      | null
      | undefined;
    const orderId =
      (typeof rel?.data?.id === "number" ? rel.data.id : null) ??
      (typeof rel?.id === "number" ? rel.id : null);
    if (!orderId) continue;

    const summary = normalizeShipmentFields(attrs);
    if (!summary) continue;
    out[orderId] = summary;
  }
  return out;
}

export function formatShipmentStatusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

export function shipmentStatusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === "delivered") return "bg-emerald-50 text-emerald-800";
  if (s === "in_transit" || s === "packed") return "bg-sky-50 text-sky-800";
  if (s === "pending") return "bg-amber-50 text-amber-900";
  if (s === "failed") return "bg-red-50 text-red-800";
  return "bg-zinc-100 text-zinc-700";
}
