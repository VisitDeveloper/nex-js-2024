"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  Eye,
  Mail,
  MoreHorizontal,
  Search,
  ShoppingBag,
  Users,
} from "lucide-react";
import { cn } from "lib/utils";
import {
  formatAdminDate,
  formatAdminMoney,
  type AdminCustomerKpis,
  type AdminCustomerRow,
} from "lib/admin-customers-model";
import { useAdminTablePagination } from "hooks/use-admin-table-pagination";
import AdminTablePagination from "components/specific_elements/portal/admin-table-pagination";

type FilterKey = "all" | "active" | "inactive" | "high_spenders" | "new_users";
type SortKey = "spent_desc" | "newest" | "activity_desc";

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";
const selectClass =
  "rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white to-zinc-50/80 p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-zinc-500">{sub}</p> : null}
    </div>
  );
}

function RowMoreMenu({
  email,
  userId,
  onCopy,
}: {
  email: string;
  userId: number;
  onCopy: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
        title="More"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default bg-transparent"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 min-w-[11rem] rounded-xl border border-zinc-200 bg-white py-1 text-sm shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full px-3 py-2 text-left text-zinc-700 hover:bg-zinc-50"
              onClick={() => {
                onCopy();
                setOpen(false);
              }}
            >
              Copy email
            </button>
            <Link
              role="menuitem"
              href={`/portal/admin/orders?userId=${userId}`}
              className="block px-3 py-2 text-zinc-700 hover:bg-zinc-50"
              onClick={() => setOpen(false)}
            >
              All orders (filtered)
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function AdminCustomersClient({
  rows,
  kpis,
}: {
  rows: AdminCustomerRow[];
  kpis: AdminCustomerKpis;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("activity_desc");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = rows.slice();

    if (needle) {
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(needle) || r.email.toLowerCase().includes(needle)
      );
    }

    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    if (filter === "active") {
      list = list.filter((r) => r.confirmed && !r.blocked);
    } else if (filter === "inactive") {
      list = list.filter((r) => !r.confirmed || r.blocked);
    } else if (filter === "high_spenders") {
      list = list.filter((r) => r.highSpender);
    } else if (filter === "new_users") {
      list = list.filter((r) => r.createdAt && new Date(r.createdAt) >= monthStart);
    }

    if (sort === "spent_desc") {
      list.sort((a, b) => b.totalSpent - a.totalSpent);
    } else if (sort === "newest") {
      list.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
    } else {
      list.sort((a, b) => {
        const ta = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
        const tb = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
        return tb - ta;
      });
    }

    return list;
  }, [rows, q, filter, sort]);

  const customersPag = useAdminTablePagination(filtered, [q, filter, sort, rows.length]);

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      /* ignore */
    }
  };

  const iconBtn =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800";

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total customers" value={String(kpis.totalCustomers)} />
        <KpiCard
          label="Active users"
          value={String(kpis.activeUsers)}
          sub="Confirmed &amp; not blocked"
        />
        <KpiCard label="New this month" value={String(kpis.newThisMonth)} sub="By signup date" />
        <KpiCard
          label="Avg order value"
          value={
            kpis.avgOrderValue > 0
              ? formatAdminMoney(kpis.avgOrderValue, kpis.avgOrderCurrency)
              : "—"
          }
          sub="Paid-through orders only"
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            className={cn(inputClass, "pl-9")}
            placeholder="Search name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search customers"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className={selectClass}
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterKey)}
            aria-label="Filter customers"
          >
            <option value="all">All customers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="high_spenders">High spenders</option>
            <option value="new_users">New this month</option>
          </select>
          <select
            className={selectClass}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort customers"
          >
            <option value="activity_desc">Last activity (recent)</option>
            <option value="spent_desc">Most spent</option>
            <option value="newest">Newest signups</option>
          </select>
        </div>
      </div>

      <div className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
          <Users className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">Customers</h2>
          <span className="text-xs text-zinc-500">
            {filtered.length} of {rows.length}
          </span>
        </div>
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse bg-white text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Total spent</th>
                <th className="px-4 py-3">Last activity</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                    No customers match your filters.
                  </td>
                </tr>
              ) : (
                customersPag.pageItems.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/60"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/portal/admin/users/${r.id}`}
                        className="font-medium text-zinc-900 hover:text-emerald-700 hover:underline"
                      >
                        {r.name}
                      </Link>
                      {r.blocked ? (
                        <span className="ml-2 rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-700">
                          Blocked
                        </span>
                      ) : null}
                      {!r.confirmed ? (
                        <span className="ml-2 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                          Unconfirmed
                        </span>
                      ) : null}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-zinc-600">{r.email}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-800">{r.totalOrders}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-zinc-900">
                      {formatAdminMoney(r.totalSpent, r.currency)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{formatAdminDate(r.lastActivityAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/portal/admin/users/${r.id}`}
                          className={iconBtn}
                          title="View profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/portal/admin/orders?userId=${r.id}`}
                          className={iconBtn}
                          title="Orders"
                        >
                          <ShoppingBag className="h-4 w-4" />
                        </Link>
                        <a
                          href={`mailto:${r.email}?subject=${encodeURIComponent("Message from Brainwave Academy")}`}
                          className={iconBtn}
                          title="Send message"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                        <RowMoreMenu
                          email={r.email}
                          userId={r.id}
                          onCopy={() => copyEmail(r.email)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AdminTablePagination
          totalCount={customersPag.totalCount}
          page={customersPag.page}
          totalPages={customersPag.totalPages}
          pageSize={customersPag.pageSize}
          rangeFrom={customersPag.rangeFrom}
          rangeTo={customersPag.rangeTo}
          onPageChange={customersPag.setPage}
          onPageSizeChange={customersPag.setPageSize}
        />
      </div>
    </div>
  );
}
