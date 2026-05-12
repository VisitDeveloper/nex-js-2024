"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { orderShipmentHasDisplayData, type OrderShipmentSummary } from "lib/order-shipment";
import { Eye, ShoppingCart } from "lucide-react";
import AdminRightDrawer from "components/specific_elements/portal/admin-right-drawer";
import AdminOrderDetailPanel from "components/specific_elements/portal/admin-order-detail-panel";
import {
  adminOrderStatusBadgeClass,
  type AdminOrderLineItem,
  type AdminOrderRow,
} from "lib/admin-order-row";
import { formatAdminDate, formatAdminMoney } from "lib/admin-customers-model";
import { cn } from "lib/utils";
import { useAdminTablePagination } from "hooks/use-admin-table-pagination";
import AdminTablePagination from "components/specific_elements/portal/admin-table-pagination";
import { OrderShipmentTableCell } from "components/order-shipment-table-cell";

export type { AdminOrderLineItem, AdminOrderRow };

const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800";

export default function AdminOrdersClient({
  rows,
  filterUserId,
  fetchError,
}: {
  rows: AdminOrderRow[];
  filterUserId?: number;
  fetchError?: string | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<AdminOrderRow | null>(null);
  const [shipmentOverlay, setShipmentOverlay] = useState<Record<number, OrderShipmentSummary>>({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const displayRows = useMemo(() => {
    return rows.map((r) => {
      const id = Number(r.id);
      const o = shipmentOverlay[id];
      return o ? { ...r, shipment: o } : r;
    });
  }, [rows, shipmentOverlay]);

  const statusOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of displayRows) s.add(r.status);
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [displayRows]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const statusOk = (r: AdminOrderRow) =>
      statusFilter === "all" ? true : r.status.toLowerCase() === statusFilter.toLowerCase();
    const queryOk = (r: AdminOrderRow) => {
      if (!q) return true;
      const orderNumber = String(r.orderNumber ?? "").toLowerCase();
      if (orderNumber.includes(q)) return true;
      if ((r.customerEmail || "").toLowerCase().includes(q)) return true;
      return r.items.some((it) => (it.title || "").toLowerCase().includes(q));
    };
    return displayRows.filter((r) => statusOk(r) && queryOk(r));
  }, [displayRows, query, statusFilter]);

  useEffect(() => {
    setShipmentOverlay((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const next = { ...prev };
      let changed = false;
      for (const key of Object.keys(next)) {
        const id = Number(key);
        const row = rows.find((r) => Number(r.id) === id);
        if (row?.shipment && orderShipmentHasDisplayData(row.shipment)) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [rows]);

  const ordersPag = useAdminTablePagination(filteredRows, [
    displayRows.length,
    filterUserId ?? "",
    query,
    statusFilter,
    filteredRows.length,
  ]);

  useEffect(() => {
    if (!selected) return;
    const fresh = displayRows.find((r) => Number(r.id) === Number(selected.id));
    if (fresh) setSelected(fresh);
  }, [displayRows, selected?.id]);

  return (
    <div className="w-full min-w-0 space-y-4">
      {fetchError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
        >
          <p className="font-semibold">Could not load orders from Strapi</p>
          <p className="mt-1 text-red-900/90">{fetchError}</p>
        </div>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Orders &amp; fulfillment</h1>
        {filterUserId ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-900">
              Filtered: customer user #{filterUserId}
            </span>
            <Link
              href="/portal/admin/orders"
              className="font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Clear filter
            </Link>
            <Link
              href={`/portal/admin/users/${filterUserId}`}
              className="font-medium text-zinc-600 hover:text-zinc-900 hover:underline"
            >
              Open profile
            </Link>
          </div>
        ) : null}
      </div>

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
          <AdminOrderDetailPanel
            order={selected}
            onApplied={() => router.refresh()}
            onShipmentSaved={(orderId, summary) =>
              setShipmentOverlay((p) => ({ ...p, [orderId]: summary }))
            }
          />
        ) : null}
      </AdminRightDrawer>

      <div className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-4 py-3">
          <ShoppingCart className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">Orders</h2>
          <span className="text-xs text-zinc-500">
            {ordersPag.totalCount} {filterUserId ? "in filter" : "total"}
          </span>
        </div>
        <div className="flex flex-col gap-2 border-b border-zinc-100 px-4 py-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <label className="sr-only" htmlFor="admin-orders-query">
              Search orders
            </label>
            <input
              id="admin-orders-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order #, customer email, item…"
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="admin-orders-status">
              Filter by status
            </label>
            <select
              id="admin-orders-status"
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
            of <span className="font-medium tabular-nums text-zinc-700">{displayRows.length}</span>
          </div>
        </div>
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse bg-white text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Shipment</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    {displayRows.length === 0
                      ? filterUserId
                        ? "No orders for this customer."
                        : "No orders yet."
                      : "No orders match your filters."}
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
                    <td className="max-w-[220px] px-4 py-3">
                      <p className="truncate text-zinc-800">{r.customerEmail || "—"}</p>
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
                      <div className="flex justify-end">
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
