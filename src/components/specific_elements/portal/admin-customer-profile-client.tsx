"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { orderShipmentHasDisplayData, type OrderShipmentSummary } from "lib/order-shipment";
import { BookOpen, Eye, MapPin, ShoppingCart } from "lucide-react";
import AdminRightDrawer from "components/specific_elements/portal/admin-right-drawer";
import AdminOrderDetailPanel from "components/specific_elements/portal/admin-order-detail-panel";
import {
  adminOrderStatusBadgeClass,
  type AdminOrderRow,
} from "lib/admin-order-row";
import type {
  AdminCustomerAddress,
  AdminCustomerTutorialSummary,
} from "lib/admin-customers-data";
import { formatAdminDate, formatAdminMoney } from "lib/admin-customers-model";
import { cn } from "lib/utils";
import { useAdminTablePagination } from "hooks/use-admin-table-pagination";
import AdminTablePagination from "components/specific_elements/portal/admin-table-pagination";
import { OrderShipmentTableCell } from "components/order-shipment-table-cell";

const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800";

function formatAddressLines(a: AdminCustomerAddress): string[] {
  const lines: string[] = [];
  if (a.receiverName) lines.push(a.receiverName);
  if (a.phone) lines.push(a.phone);
  const cityLine = [a.province, a.city].filter(Boolean).join(", ");
  if (cityLine) lines.push(cityLine);
  if (a.addressLine1) lines.push(a.addressLine1);
  if (a.addressLine2) lines.push(a.addressLine2);
  if (a.postalCode) lines.push(a.postalCode);
  return lines;
}

export default function AdminCustomerProfileClient({
  userId,
  userEmail,
  orderRows,
  addresses,
  tutorials,
}: {
  userId: number;
  userEmail: string;
  orderRows: AdminOrderRow[];
  addresses: AdminCustomerAddress[];
  tutorials: AdminCustomerTutorialSummary[];
}) {
  const router = useRouter();
  const [orderSelected, setOrderSelected] = useState<AdminOrderRow | null>(null);
  const [addressSelected, setAddressSelected] = useState<AdminCustomerAddress | null>(null);
  const [shipmentOverlay, setShipmentOverlay] = useState<Record<number, OrderShipmentSummary>>({});

  const displayOrderRows = useMemo(() => {
    return orderRows.map((r) => {
      const id = Number(r.id);
      const o = shipmentOverlay[id];
      return o ? { ...r, shipment: o } : r;
    });
  }, [orderRows, shipmentOverlay]);

  useEffect(() => {
    setShipmentOverlay((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const next = { ...prev };
      let changed = false;
      for (const key of Object.keys(next)) {
        const id = Number(key);
        const row = orderRows.find((r) => Number(r.id) === id);
        if (row?.shipment && orderShipmentHasDisplayData(row.shipment)) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [orderRows]);

  const ordersPag = useAdminTablePagination(displayOrderRows, [displayOrderRows.length, userId]);
  const addrPag = useAdminTablePagination(addresses, [addresses.length, userId]);
  const tutorialsPag = useAdminTablePagination(tutorials, [tutorials.length, userId]);

  useEffect(() => {
    if (!orderSelected) return;
    const fresh = displayOrderRows.find((r) => Number(r.id) === Number(orderSelected.id));
    if (fresh) setOrderSelected(fresh);
  }, [displayOrderRows, orderSelected?.id]);

  return (
    <div className="w-full min-w-0 space-y-8">
      <AdminRightDrawer
        open={orderSelected != null}
        onOpenChange={(open) => {
          if (!open) setOrderSelected(null);
        }}
        size="wide"
        title={orderSelected ? `Order ${orderSelected.orderNumber}` : "Order"}
        description={
          orderSelected
            ? `${formatAdminDate(orderSelected.createdAt)} · ${orderSelected.status}`
            : undefined
        }
      >
        {orderSelected ? (
          <AdminOrderDetailPanel
            order={orderSelected}
            onApplied={() => router.refresh()}
            onShipmentSaved={(orderId, summary) =>
              setShipmentOverlay((p) => ({ ...p, [orderId]: summary }))
            }
          />
        ) : null}
      </AdminRightDrawer>

      <AdminRightDrawer
        open={addressSelected != null}
        onOpenChange={(open) => {
          if (!open) setAddressSelected(null);
        }}
        title={addressSelected?.label || "Address"}
        description={addressSelected ? `Saved address #${addressSelected.id}` : undefined}
      >
        {addressSelected ? (
          <div className="space-y-3 text-sm text-zinc-800">
            {formatAddressLines(addressSelected).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            {formatAddressLines(addressSelected).length === 0 ? (
              <p className="text-zinc-500">No address lines stored.</p>
            ) : null}
          </div>
        ) : null}
      </AdminRightDrawer>

      <div className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-4 py-3">
          <ShoppingCart className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">Order history</h2>
          <span className="text-xs text-zinc-500">{ordersPag.totalCount} orders</span>
          <Link
            href={`/portal/admin/orders?userId=${userId}`}
            className="ml-auto text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            Open in Orders
          </Link>
        </div>
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse bg-white text-left text-sm">
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
              {displayOrderRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    No orders linked to this customer profile yet.
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
                    <td className="max-w-[200px] px-4 py-3">
                      <p className="truncate text-zinc-800">{r.customerEmail || userEmail}</p>
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
                          onClick={() => setOrderSelected(r)}
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

      <div className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-4 py-3">
          <MapPin className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">Saved addresses</h2>
          <span className="text-xs text-zinc-500">{addrPag.totalCount} saved</span>
        </div>
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse bg-white text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {addresses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-zinc-500">
                    No addresses saved for this account.
                  </td>
                </tr>
              ) : (
                addrPag.pageItems.map((a) => {
                  const loc = [a.province, a.city].filter(Boolean).join(", ") || "—";
                  const summary = a.addressLine1
                    ? a.addressLine1.length > 42
                      ? `${a.addressLine1.slice(0, 42)}…`
                      : a.addressLine1
                    : "—";
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/60"
                    >
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        {a.label || "Address"}
                      </td>
                      <td className="max-w-[160px] truncate px-4 py-3 text-zinc-800">
                        {a.receiverName || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-600">{a.phone || "—"}</td>
                      <td className="max-w-[220px] px-4 py-3">
                        <p className="truncate text-zinc-600" title={summary}>
                          {loc} · {summary}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            title="View full address"
                            onClick={() => setAddressSelected(a)}
                            className={iconBtn}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <AdminTablePagination
          totalCount={addrPag.totalCount}
          page={addrPag.page}
          totalPages={addrPag.totalPages}
          pageSize={addrPag.pageSize}
          rangeFrom={addrPag.rangeFrom}
          rangeTo={addrPag.rangeTo}
          onPageChange={addrPag.setPage}
          onPageSizeChange={addrPag.setPageSize}
        />
      </div>

      <div className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-4 py-3">
          <BookOpen className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">Product tutorials</h2>
          <span className="text-xs text-zinc-500">
            Unlocked by paid / fulfilled orders (same rules as the customer portal)
          </span>
        </div>
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse bg-white text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-right">Storefront</th>
              </tr>
            </thead>
            <tbody>
              {tutorials.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-zinc-500">
                    No entitled tutorials for this customer yet (needs a qualifying purchase with a
                    tutorial-enabled product).
                  </td>
                </tr>
              ) : (
                tutorialsPag.pageItems.map((t) => (
                  <tr
                    key={t.slug}
                    className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/60"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">{t.title}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-zinc-600">
                      {t.slug}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/shop/${encodeURIComponent(t.slug)}`}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                      >
                        View product
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminTablePagination
          totalCount={tutorialsPag.totalCount}
          page={tutorialsPag.page}
          totalPages={tutorialsPag.totalPages}
          pageSize={tutorialsPag.pageSize}
          rangeFrom={tutorialsPag.rangeFrom}
          rangeTo={tutorialsPag.rangeTo}
          onPageChange={tutorialsPag.setPage}
          onPageSizeChange={tutorialsPag.setPageSize}
        />
      </div>
    </div>
  );
}
