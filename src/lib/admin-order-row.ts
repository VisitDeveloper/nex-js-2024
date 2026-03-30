/** Shared shape for admin order tables + detail drawer (orders list + customer profile). */

import type { OrderShipmentSummary } from "lib/order-shipment";
import type { OrderShippingAddressSummary } from "lib/order-shipping-address";

export type AdminOrderLineItem = {
  title: string;
  sku: string;
  quantity: number;
  lineTotal: number;
  productTitle: string | null;
};

export type AdminOrderPaymentRow = {
  id: number;
  provider: string;
  providerPaymentId: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: string | null;
  meta: unknown;
};

export type AdminOrderRow = {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string | null;
  customerEmail: string;
  customerUserId: number | null;
  items: AdminOrderLineItem[];
  shipment: OrderShipmentSummary | null;
  shippingAddress: OrderShippingAddressSummary | null;
  payments: AdminOrderPaymentRow[];
};

/** Parse Strapi REST order entity `attributes.paymentTransactions`. */
export function parseAdminOrderPaymentsFromOrder(order: unknown): AdminOrderPaymentRow[] {
  if (!order || typeof order !== "object") return [];
  const attrs = (order as { attributes?: Record<string, unknown> }).attributes;
  const wrap = attrs?.paymentTransactions as { data?: unknown } | undefined;
  const list = wrap?.data;
  if (!Array.isArray(list)) return [];
  const rows: AdminOrderPaymentRow[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const ent = item as { id?: number; attributes?: Record<string, unknown> };
    if (typeof ent.id !== "number") continue;
    const a = ent.attributes ?? {};
    rows.push({
      id: ent.id,
      provider: String(a.provider ?? "stripe"),
      providerPaymentId: String(a.providerPaymentId ?? ""),
      status: String(a.status ?? ""),
      amount: Number(a.amount) || 0,
      currency: String(a.currency ?? "USD"),
      createdAt: typeof a.createdAt === "string" ? a.createdAt : null,
      meta: a.meta ?? null,
    });
  }
  rows.sort((x, y) => {
    const tx = x.createdAt ? new Date(x.createdAt).getTime() : 0;
    const ty = y.createdAt ? new Date(y.createdAt).getTime() : 0;
    return ty - tx;
  });
  return rows;
}

export function adminOrderStatusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === "delivered" || s === "paid" || s === "completed") {
    return "bg-emerald-50 text-emerald-800";
  }
  if (s === "processing" || s === "shipped") {
    return "bg-sky-50 text-sky-800";
  }
  if (
    s === "pending" ||
    s === "draft" ||
    s === "awaiting_payment" ||
    s === "pending_payment"
  ) {
    return "bg-amber-50 text-amber-900";
  }
  if (
    s === "cancelled" ||
    s === "canceled" ||
    s === "refunded" ||
    s === "payment_failed"
  ) {
    return "bg-red-50 text-red-800";
  }
  return "bg-zinc-100 text-zinc-700";
}
