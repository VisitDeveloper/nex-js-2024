/** Mirrors `ORDER_TRANSITIONS` in brainwave-strapi/src/api/order/services/order.js */

const ORDER_NEXT_STATUSES: Record<string, string[]> = {
  draft: ["pending_payment", "cancelled"],
  pending_payment: ["paid", "cancelled", "payment_failed"],
  paid: ["processing", "refunded"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  payment_failed: [],
  refunded: [],
  returned: [],
};

export function allowedNextOrderStatuses(currentStatus: string): string[] {
  const key = String(currentStatus || "").trim();
  return ORDER_NEXT_STATUSES[key] ?? [];
}

export const SHIPMENT_STATUS_OPTIONS = [
  "pending",
  "packed",
  "in_transit",
  "delivered",
  "failed",
] as const;

export type ShipmentStatusOption = (typeof SHIPMENT_STATUS_OPTIONS)[number];
