"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  adminOrderStatusBadgeClass,
  type AdminOrderRow,
} from "lib/admin-order-row";
import { formatAdminDate, formatAdminMoney } from "lib/admin-customers-model";
import {
  allowedNextOrderStatuses,
  SHIPMENT_STATUS_OPTIONS,
} from "lib/order-admin-transitions";
import {
  formatShipmentStatusLabel,
  orderShipmentHasDisplayData,
  type OrderShipmentSummary,
} from "lib/order-shipment";
import { cn } from "lib/utils";
import { OrderShippingAddressDetailSection } from "components/order-shipping-address-detail";

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50";

function formatOrderStatusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(v: string): string | null {
  const t = v.trim();
  if (!t) return null;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function paymentMetaHint(meta: unknown): string | null {
  if (!meta || typeof meta !== "object") return null;
  const m = meta as Record<string, unknown>;
  const sid = m.sessionId;
  if (typeof sid === "string" && sid.trim()) return sid.trim();
  return null;
}

function paymentStatusClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "succeeded") return "bg-emerald-50 text-emerald-800";
  if (s === "pending") return "bg-amber-50 text-amber-900";
  if (s === "failed") return "bg-red-50 text-red-800";
  if (s === "refunded") return "bg-zinc-200 text-zinc-800";
  return "bg-zinc-100 text-zinc-700";
}

function errMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "Request failed";
  const o = data as Record<string, unknown>;
  if (typeof o.error === "string") return o.error;
  if (o.error && typeof o.error === "object") {
    const em = (o.error as { message?: unknown }).message;
    if (typeof em === "string") return em;
    if (Array.isArray(em) && em.length > 0 && typeof em[0] === "object" && em[0] && "message" in em[0]) {
      return String((em[0] as { message?: unknown }).message);
    }
  }
  const det = o.details;
  if (det && typeof det === "object" && "error" in det) {
    const e = (det as { error?: { message?: string } }).error;
    if (e && typeof e.message === "string") return e.message;
  }
  return "Request failed";
}

export default function AdminOrderDetailPanel({
  order,
  onApplied,
  onShipmentSaved,
}: {
  order: AdminOrderRow;
  /** Call `router.refresh` so lists + this drawer get fresh Strapi data. */
  onApplied?: () => void;
  /** Merge shipment into admin tables immediately (Strapi list populate can lag shape/cache). */
  onShipmentSaved?: (orderId: number, summary: OrderShipmentSummary) => void;
}) {
  const nextOptions = allowedNextOrderStatuses(order.status);
  const [transitionTo, setTransitionTo] = useState("");
  const [transitionNote, setTransitionNote] = useState("");
  const [transitionBusy, setTransitionBusy] = useState(false);
  const [transitionErr, setTransitionErr] = useState<string | null>(null);

  const [carrier, setCarrier] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [shipStatus, setShipStatus] = useState<string>(SHIPMENT_STATUS_OPTIONS[0]);
  const [shippedAt, setShippedAt] = useState("");
  const [deliveredAt, setDeliveredAt] = useState("");
  const [shipBusy, setShipBusy] = useState(false);
  const [shipErr, setShipErr] = useState<string | null>(null);
  const [shipOk, setShipOk] = useState<string | null>(null);

  const shipmentSyncKey = JSON.stringify(order.shipment ?? null);
  const paymentSyncKey = order.payments.map((p) => `${p.id}:${p.status}:${p.amount}`).join("|");

  useEffect(() => {
    setTransitionTo("");
    setTransitionNote("");
    setTransitionErr(null);
    const sh = order.shipment;
    setCarrier(sh?.carrier ?? "");
    setTrackingCode(sh?.trackingCode ?? "");
    setShipStatus(
      sh?.status && SHIPMENT_STATUS_OPTIONS.includes(sh.status as (typeof SHIPMENT_STATUS_OPTIONS)[number])
        ? sh.status
        : "pending"
    );
    setShippedAt(isoToDatetimeLocal(sh?.shippedAt));
    setDeliveredAt(isoToDatetimeLocal(sh?.deliveredAt));
    setShipErr(null);
    setShipOk(null);
  }, [order.id, shipmentSyncKey, paymentSyncKey]);

  async function applyTransition() {
    if (!transitionTo) return;
    setTransitionBusy(true);
    setTransitionErr(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/transition`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextStatus: transitionTo,
          ...(transitionNote.trim() ? { note: transitionNote.trim() } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTransitionErr(errMessage(data));
        return;
      }
      onApplied?.();
    } catch {
      setTransitionErr("Network error");
    } finally {
      setTransitionBusy(false);
    }
  }

  async function saveShipment() {
    setShipBusy(true);
    setShipErr(null);
    setShipOk(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/shipment`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: shipStatus,
          carrier: carrier.trim() || null,
          trackingCode: trackingCode.trim() || null,
          shippedAt: datetimeLocalToIso(shippedAt),
          deliveredAt: datetimeLocalToIso(deliveredAt),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setShipErr(errMessage(data));
        return;
      }
      setShipOk("Shipment saved.");
      const summary = (data as { shipmentSummary?: OrderShipmentSummary }).shipmentSummary;
      if (summary) {
        onShipmentSaved?.(order.id, summary);
      }
      onApplied?.();
    } catch {
      setShipErr("Network error");
    } finally {
      setShipBusy(false);
    }
  }

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-semibold uppercase",
            adminOrderStatusBadgeClass(order.status)
          )}
        >
          {order.status}
        </span>
        <span className="text-lg font-semibold tabular-nums text-zinc-900">
          {formatAdminMoney(order.totalAmount, order.currency)}
        </span>
      </div>

      {order.customerEmail ? (
        <p className="text-zinc-600">
          <span className="font-medium text-zinc-700">Customer: </span>
          {order.customerEmail}
          {order.customerUserId != null ? (
            <span className="ml-2 inline-flex flex-wrap gap-2">
              <Link
                href={`/portal/admin/users/${order.customerUserId}`}
                className="font-medium text-emerald-700 hover:underline"
              >
                Profile
              </Link>
              <Link
                href={`/portal/admin/orders?userId=${order.customerUserId}`}
                className="font-medium text-zinc-600 hover:text-zinc-900 hover:underline"
              >
                Their orders
              </Link>
            </span>
          ) : null}
        </p>
      ) : (
        <p className="text-zinc-500">No customer email on file.</p>
      )}

      <OrderShippingAddressDetailSection address={order.shippingAddress} />

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Payments</p>
        {order.payments.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No payment transactions linked to this order.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {order.payments.map((p) => {
              const hint = paymentMetaHint(p.meta);
              return (
                <li
                  key={p.id}
                  className="rounded-lg border border-zinc-100 bg-zinc-50/60 px-3 py-2.5 text-zinc-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                        paymentStatusClass(p.status)
                      )}
                    >
                      {p.status}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-zinc-900">
                      {formatAdminMoney(p.amount, p.currency)}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-zinc-600">
                    {p.provider} · {p.providerPaymentId || "—"}
                  </p>
                  {p.createdAt ? (
                    <p className="mt-0.5 text-[11px] text-zinc-500">{formatAdminDate(p.createdAt)}</p>
                  ) : null}
                  {hint ? (
                    <p className="mt-0.5 text-[11px] text-zinc-500">Stripe session / ref: {hint}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {order.shipment && orderShipmentHasDisplayData(order.shipment) ? (
        <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50/40 px-3 py-2 text-xs text-emerald-950">
          <span className="font-semibold text-emerald-900">Saved shipment: </span>
          {[
            order.shipment.trackingCode,
            order.shipment.carrier,
            order.shipment.status ? formatShipmentStatusLabel(order.shipment.status) : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Change order status</p>
        <p className="mt-1 text-xs text-zinc-500">
          Only allowed next steps from <span className="font-mono">{order.status}</span> are listed.
        </p>
        {nextOptions.length === 0 ? (
          <p className="mt-3 text-zinc-500">No further transitions (terminal state).</p>
        ) : (
          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor={`admin-order-next-${order.id}`} className="text-xs font-medium text-zinc-600">
                Next status
              </label>
              <select
                id={`admin-order-next-${order.id}`}
                className={inputClass}
                value={transitionTo}
                onChange={(e) => setTransitionTo(e.target.value)}
              >
                <option value="">Select…</option>
                {nextOptions.map((s) => (
                  <option key={s} value={s}>
                    {formatOrderStatusLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`admin-order-note-${order.id}`} className="text-xs font-medium text-zinc-600">
                Note (optional)
              </label>
              <input
                id={`admin-order-note-${order.id}`}
                className={inputClass}
                value={transitionNote}
                onChange={(e) => setTransitionNote(e.target.value)}
                placeholder="Shown in order timeline"
              />
            </div>
            {transitionErr ? (
              <p className="text-xs font-medium text-red-700" role="alert">
                {transitionErr}
              </p>
            ) : null}
            <button
              type="button"
              className={btnPrimary}
              disabled={transitionBusy || !transitionTo}
              onClick={() => void applyTransition()}
            >
              {transitionBusy ? "Applying…" : "Apply status"}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Shipping / tracking</p>
        <p className="mt-1 text-xs text-zinc-500">
          Updates the shipment record linked to this order (creates one if missing).
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor={`admin-ship-carrier-${order.id}`} className="text-xs font-medium text-zinc-600">
              Carrier
            </label>
            <input
              id={`admin-ship-carrier-${order.id}`}
              className={inputClass}
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="e.g. Post, DHL"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`admin-ship-track-${order.id}`} className="text-xs font-medium text-zinc-600">
              Tracking code
            </label>
            <input
              id={`admin-ship-track-${order.id}`}
              className={`${inputClass} font-mono`}
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="Tracking number"
            />
          </div>
          <div>
            <label htmlFor={`admin-ship-status-${order.id}`} className="text-xs font-medium text-zinc-600">
              Shipment status
            </label>
            <select
              id={`admin-ship-status-${order.id}`}
              className={inputClass}
              value={shipStatus}
              onChange={(e) => setShipStatus(e.target.value)}
            >
              {SHIPMENT_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {formatShipmentStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`admin-ship-shipped-${order.id}`} className="text-xs font-medium text-zinc-600">
              Shipped at
            </label>
            <input
              id={`admin-ship-shipped-${order.id}`}
              type="datetime-local"
              className={inputClass}
              value={shippedAt}
              onChange={(e) => setShippedAt(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`admin-ship-delivered-${order.id}`} className="text-xs font-medium text-zinc-600">
              Delivered at
            </label>
            <input
              id={`admin-ship-delivered-${order.id}`}
              type="datetime-local"
              className={inputClass}
              value={deliveredAt}
              onChange={(e) => setDeliveredAt(e.target.value)}
            />
          </div>
        </div>
        {shipErr ? (
          <p className="mt-2 text-xs font-medium text-red-700" role="alert">
            {shipErr}
          </p>
        ) : null}
        {shipOk ? <p className="mt-2 text-xs font-medium text-emerald-800">{shipOk}</p> : null}
        <button
          type="button"
          className={cn(btnPrimary, "mt-3")}
          disabled={shipBusy}
          onClick={() => void saveShipment()}
        >
          {shipBusy ? "Saving…" : "Save shipment"}
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Line items</p>
        {order.items.length === 0 ? (
          <p className="mt-2 text-zinc-500">No line items returned for this order.</p>
        ) : (
          <ul className="mt-2 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-zinc-50/50">
            {order.items.map((it, idx) => (
              <li
                key={idx}
                className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">{it.productTitle || it.title || "Item"}</p>
                  <p className="text-xs text-zinc-500">
                    Qty {it.quantity}
                    {it.sku ? ` · SKU ${it.sku}` : ""}
                  </p>
                </div>
                <p className="shrink-0 tabular-nums font-medium text-zinc-800">
                  {formatAdminMoney(it.lineTotal, order.currency)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
