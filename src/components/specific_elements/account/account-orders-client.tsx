"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Ban, CreditCard, Eye, MessageCircle, ShoppingCart } from "lucide-react";
import AdminRightDrawer from "components/specific_elements/portal/admin-right-drawer";
import { adminOrderStatusBadgeClass } from "lib/admin-order-row";
import { formatAdminDate, formatAdminMoney } from "lib/admin-customers-model";
import type { AccountOrderListRow } from "lib/account-portal-types";
import { saveShopCart } from "lib/shop-cart";
import { cn } from "lib/utils";
import { useAdminTablePagination } from "hooks/use-admin-table-pagination";
import AdminTablePagination from "components/specific_elements/portal/admin-table-pagination";
import {
  OrderShipmentDetailSection,
  OrderShipmentTableCell,
} from "components/order-shipment-table-cell";
import { OrderShippingAddressDetailSection } from "components/order-shipping-address-detail";

const ENTITLED_FOR_TUTORIAL = new Set([
  "paid",
  "processing",
  "shipped",
  "delivered",
]);

const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800";

const SUPPORT_PREFILL_ITEM_CAP = 8;

function isPendingPaymentStatus(status: string): boolean {
  return status.toLowerCase() === "pending_payment";
}

function supportHrefForOrder(row: AccountOrderListRow): string {
  const titles = row.lineItems.map((it) => it.title);
  const shown = titles.slice(0, SUPPORT_PREFILL_ITEM_CAP);
  const more =
    titles.length > SUPPORT_PREFILL_ITEM_CAP
      ? `\n• … and ${titles.length - SUPPORT_PREFILL_ITEM_CAP} more`
      : "";
  const itemBlock =
    shown.length > 0
      ? shown.map((t) => `• ${t}`).join("\n") + more
      : "—";
  const body = `I'm reaching out about order ${row.orderNumber}.

Items:
${itemBlock}

Please describe your issue or question below:

`;
  const params = new URLSearchParams();
  params.set("subject", `Order ${row.orderNumber}`);
  params.set("body", body);
  return `/account/support?${params.toString()}`;
}

export default function AccountOrdersClient({
  signedIn,
  rows,
  checkoutSuccess,
  stripeSessionId,
  fetchError,
}: {
  signedIn: boolean;
  rows: AccountOrderListRow[];
  checkoutSuccess?: boolean;
  stripeSessionId?: string | null;
  fetchError?: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<AccountOrderListRow | null>(null);
  const [checkoutBusyId, setCheckoutBusyId] = useState<number | null>(null);
  const [abandonBusyId, setAbandonBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const verifyAttemptedFor = useRef<string | null>(null);

  const statusOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) s.add(r.status);
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const statusOk = (r: AccountOrderListRow) =>
      statusFilter === "all" ? true : r.status.toLowerCase() === statusFilter.toLowerCase();
    const queryOk = (r: AccountOrderListRow) => {
      if (!q) return true;
      const orderNumber = String(r.orderNumber ?? "").toLowerCase();
      if (orderNumber.includes(q)) return true;
      return r.lineItems.some((it) => (it.title || "").toLowerCase().includes(q));
    };
    return rows.filter((r) => statusOk(r) && queryOk(r));
  }, [rows, query, statusFilter]);

  const ordersPag = useAdminTablePagination(filteredRows, [
    rows.length,
    query,
    statusFilter,
    filteredRows.length,
  ]);

  async function resumeCheckoutForOrder(orderId: number) {
    setActionError(null);
    setCheckoutBusyId(orderId);
    try {
      const origin = window.location.origin;
      const response = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          resumeOrderId: orderId,
          successUrl: `${origin}/account/orders?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/account/orders`,
        }),
      });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Could not start checkout");
      }
      if (!payload.url) {
        throw new Error("Checkout did not return a URL");
      }
      window.location.href = payload.url;
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setCheckoutBusyId(null);
    }
  }

  async function abandonPendingOrder(orderId: number) {
    if (
      !window.confirm(
        "Close this unpaid order? It will be marked as payment failed and you will not be able to pay it again."
      )
    ) {
      return;
    }
    setActionError(null);
    setAbandonBusyId(orderId);
    try {
      const response = await fetch("/api/shop/order-abandon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Could not update order");
      }
      if (selected?.id === orderId) {
        setSelected(null);
      }
      router.refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setAbandonBusyId(null);
    }
  }

  useEffect(() => {
    if (checkoutSuccess) {
      saveShopCart([], null);
    }
  }, [checkoutSuccess]);

  useEffect(() => {
    if (!signedIn || !checkoutSuccess || !stripeSessionId) return;
    if (verifyAttemptedFor.current === stripeSessionId) return;
    verifyAttemptedFor.current = stripeSessionId;
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch("/api/shop/verify-checkout", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: stripeSessionId }),
        });
        if (!cancelled && r.ok) {
          router.refresh();
        }
      } catch {
        /* webhook or manual refresh can still update */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn, checkoutSuccess, stripeSessionId, router]);

  if (!signedIn) {
    return (
      <p className="text-sm text-zinc-600">
        <Link href="/auth" className="font-medium text-emerald-700 underline">
          Sign in
        </Link>{" "}
        to see orders linked to your account.
      </p>
    );
  }

  const showTutorial = selected?.status && ENTITLED_FOR_TUTORIAL.has(selected.status);

  return (
    <div className="w-full min-w-0 space-y-4">
      {fetchError ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          <p className="font-semibold">Could not load orders</p>
          <p className="mt-1 text-amber-900/90">{fetchError}</p>
        </div>
      ) : null}
      {checkoutSuccess ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          <p className="font-semibold">Payment received</p>
          <p className="mt-1 text-emerald-800">
            Thanks — we are confirming your payment with the store. Your order should show as <strong>paid</strong>{" "}
            below shortly; refresh if it still says pending.
          </p>
        </div>
      ) : null}
      {actionError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
        >
          <p className="font-semibold">Action failed</p>
          <p className="mt-1 text-red-900/90">{actionError}</p>
        </div>
      ) : null}
      <AdminRightDrawer
        open={selected != null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        size="wide"
        title={selected ? `Order ${selected.orderNumber}` : "Order"}
        description={
          selected
            ? `${formatAdminDate(selected.createdAt)} · ${selected.status}`
            : undefined
        }
      >
        {selected ? (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-semibold uppercase",
                  adminOrderStatusBadgeClass(selected.status)
                )}
              >
                {selected.status}
              </span>
              <span className="text-lg font-semibold tabular-nums text-zinc-900">
                {formatAdminMoney(selected.totalAmount, selected.currency)}
              </span>
            </div>
            <OrderShippingAddressDetailSection address={selected.shippingAddress} />
            <OrderShipmentDetailSection shipment={selected.shipment} heading="Shipment tracking" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Items
              </p>
              {selected.lineItems.length === 0 ? (
                <p className="mt-2 text-zinc-500">No line items on this order.</p>
              ) : (
                <ul className="mt-2 divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-zinc-50/50">
                  {selected.lineItems.map((it) => (
                    <li
                      key={it.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
                    >
                      <span className="font-medium text-zinc-900">
                        {it.title}
                        <span className="ml-1 text-xs font-semibold text-zinc-500">
                          x{Math.max(1, Math.floor(Number(it.quantity) || 1))}
                        </span>
                      </span>
                      {showTutorial && it.productSlug ? (
                        <Link
                          href={`/account/tutorials/${encodeURIComponent(it.productSlug)}`}
                          className="text-xs font-semibold text-emerald-700 hover:underline"
                        >
                          Tutorial
                        </Link>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {selected && isPendingPaymentStatus(selected.status) ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={checkoutBusyId === selected.id}
                  onClick={() => void resumeCheckoutForOrder(selected.id)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  <CreditCard className="h-4 w-4 shrink-0" aria-hidden />
                  {checkoutBusyId === selected.id ? "Redirecting…" : "Pay now"}
                </button>
                <button
                  type="button"
                  disabled={abandonBusyId === selected.id}
                  onClick={() => void abandonPendingOrder(selected.id)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-800 hover:bg-red-50 disabled:opacity-60"
                >
                  <Ban className="h-4 w-4 shrink-0" aria-hidden />
                  {abandonBusyId === selected.id ? "Updating…" : "Mark payment failed"}
                </button>
              </div>
            ) : null}
            <div>
              <Link
                href={supportHrefForOrder(selected)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100/90"
              >
                <MessageCircle className="h-4 w-4 shrink-0" aria-hidden />
                Contact support about this order
              </Link>
            </div>
          </div>
        ) : null}
      </AdminRightDrawer>

      <div className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-4 py-3">
          <ShoppingCart className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">Your orders</h2>
          <span className="text-xs text-zinc-500">{ordersPag.totalCount} total</span>
        </div>
        <div className="flex flex-col gap-2 border-b border-zinc-100 px-4 py-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <label className="sr-only" htmlFor="orders-query">
              Search orders
            </label>
            <input
              id="orders-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order # or item…"
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="orders-status">
              Filter by status
            </label>
            <select
              id="orders-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <option value="all">All statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
              }}
              disabled={query.trim() === "" && statusFilter === "all"}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Reset
            </button>
          </div>
          <div className="text-xs text-zinc-500 sm:ml-auto">
            Showing <span className="font-medium tabular-nums text-zinc-700">{filteredRows.length}</span>{" "}
            of <span className="font-medium tabular-nums text-zinc-700">{rows.length}</span>
          </div>
        </div>
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse bg-white text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3" scope="col">
                  Order
                </th>
                <th className="px-4 py-3" scope="col">
                  Date
                </th>
                <th className="px-4 py-3" scope="col">
                  Status
                </th>
                <th className="px-4 py-3" scope="col">
                  Shipment
                </th>
                <th className="px-4 py-3 text-right" scope="col">
                  Total
                </th>
                <th className="px-4 py-3 text-right" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                    {fetchError ? "—" : rows.length === 0 ? "No orders yet." : "No orders match your filters."}
                  </td>
                </tr>
              ) : (
                ordersPag.pageItems.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/60"
                  >
                    <td className="px-4 py-3 font-semibold text-zinc-900">{r.orderNumber}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                      {formatAdminDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                          adminOrderStatusBadgeClass(r.status)
                        )}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="max-w-[180px] px-4 py-3">
                      <OrderShipmentTableCell shipment={r.shipment} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-zinc-900">
                      {formatAdminMoney(r.totalAmount, r.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {isPendingPaymentStatus(r.status) ? (
                          <>
                            <button
                              type="button"
                              title="Pay now"
                              disabled={checkoutBusyId === r.id}
                              onClick={() => void resumeCheckoutForOrder(r.id)}
                              className={iconBtn}
                            >
                              <CreditCard className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              title="Mark payment failed"
                              disabled={abandonBusyId === r.id}
                              onClick={() => void abandonPendingOrder(r.id)}
                              className={iconBtn}
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          </>
                        ) : null}
                        <Link
                          href={supportHrefForOrder(r)}
                          title="Message support about this order"
                          className={iconBtn}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          title="View details"
                          onClick={() => setSelected(r)}
                          className={iconBtn}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminTablePagination
          totalCount={ordersPag.totalCount}
          page={ordersPag.page}
          totalPages={ordersPag.totalPages}
          pageSize={ordersPag.pageSize}
          rangeFrom={ordersPag.rangeFrom}
          rangeTo={ordersPag.rangeTo}
          onPageChange={ordersPag.setPage}
          onPageSizeChange={ordersPag.setPageSize}
        />
      </div>
    </div>
  );
}
