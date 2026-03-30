import Link from "next/link";
import { notFound } from "next/navigation";
import AdminCustomerProfileClient from "components/specific_elements/portal/admin-customer-profile-client";
import {
  loadAdminCustomerProfile,
  type AdminCustomerProfileOrder,
} from "lib/admin-customers-data";
import type { AdminOrderRow } from "lib/admin-order-row";
import { formatAdminDate, formatAdminMoney } from "lib/admin-customers-model";

function activityEntries(orders: AdminCustomerProfileOrder[]) {
  const rows: { at: string; text: string }[] = [];
  for (const o of orders) {
    if (o.createdAt) {
      rows.push({
        at: o.createdAt,
        text: `Order ${o.orderNumber} updated — ${o.status}`,
      });
    }
    const tl = o.timeline;
    if (Array.isArray(tl)) {
      for (const ev of tl) {
        if (ev && typeof ev === "object") {
          const rec = ev as Record<string, unknown>;
          const at = rec.at ?? rec.time ?? rec.createdAt;
          const msg = rec.message ?? rec.label ?? rec.status ?? JSON.stringify(ev);
          if (at) rows.push({ at: String(at), text: String(msg) });
        }
      }
    }
  }
  rows.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return rows;
}

function purchasedSummary(orders: AdminCustomerProfileOrder[]) {
  const map = new Map<string, { title: string; qty: number; spent: number }>();
  for (const o of orders) {
    for (const it of o.items) {
      const title = it.productTitle || it.title || it.sku || "Item";
      const prev = map.get(title) || { title, qty: 0, spent: 0 };
      prev.qty += it.quantity;
      prev.spent += it.lineTotal;
      map.set(title, prev);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.spent - a.spent);
}

function toAdminOrderRowsForUser(
  orders: AdminCustomerProfileOrder[],
  user: { id: number; email: string }
): AdminOrderRow[] {
  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    totalAmount: o.totalAmount,
    currency: o.currency,
    createdAt: o.createdAt,
    customerEmail: user.email,
    customerUserId: user.id,
    items: o.items.map((it) => ({
      title: it.title,
      sku: it.sku,
      quantity: it.quantity,
      lineTotal: it.lineTotal,
      productTitle: it.productTitle,
    })),
    shipment: o.shipment,
    shippingAddress: o.shippingAddress,
    payments: o.payments,
  }));
}

const card =
  "rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm";
const h2 = "text-sm font-semibold uppercase tracking-wide text-zinc-500";

export default async function AdminCustomerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const data = await loadAdminCustomerProfile(id);
  if (!data?.user) notFound();

  const { user, profile, orders, totals, addresses, tutorials } = data;
  const displayName = profile?.fullName?.trim() || user.username || user.email;
  const activities = activityEntries(orders);
  const products = purchasedSummary(orders);

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/portal/admin/users"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            ← Customers
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">{displayName}</h1>
          <p className="mt-1 text-sm text-zinc-600">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/portal/admin/orders?userId=${user.id}`}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
          >
            View orders
          </Link>
          <a
            href={`mailto:${user.email}?subject=${encodeURIComponent("Message from Brainwave Academy")}`}
            className="rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Send message
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className={card}>
          <p className={h2}>Lifetime value</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900">
            {formatAdminMoney(totals.totalSpent, totals.currency)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Paid-through orders only</p>
        </div>
        <div className={card}>
          <p className={h2}>Orders</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900">{totals.orderCount}</p>
          <p className="mt-1 text-xs text-zinc-500">All statuses</p>
        </div>
        <div className={card}>
          <p className={h2}>Loyalty points</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900">
            {profile?.loyaltyPoints ?? 0}
          </p>
          <p className="mt-1 text-xs text-zinc-500">From customer profile</p>
        </div>
      </div>

      <section className={card}>
        <h2 className={h2}>Account</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">Username</dt>
            <dd className="font-medium text-zinc-900">{user.username || "—"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Phone</dt>
            <dd className="font-medium text-zinc-900">{profile?.phoneNumber || "—"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Confirmed</dt>
            <dd className="font-medium text-zinc-900">{user.confirmed ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Blocked</dt>
            <dd className="font-medium text-zinc-900">{user.blocked ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Signed up</dt>
            <dd className="font-medium text-zinc-900">{formatAdminDate(user.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Last profile sync</dt>
            <dd className="font-medium text-zinc-900">{formatAdminDate(user.updatedAt)}</dd>
          </div>
        </dl>
      </section>

      <AdminCustomerProfileClient
        userId={user.id}
        userEmail={user.email}
        orderRows={toAdminOrderRowsForUser(orders, user)}
        addresses={addresses}
        tutorials={tutorials}
      />

      <section className={`${card} w-full min-w-0 p-0`}>
        <div className="border-b border-zinc-100 px-5 py-4">
          <h2 className={h2}>Purchased products</h2>
        </div>
        <div className="w-full min-w-0 overflow-x-auto px-0 pb-0">
          {products.length === 0 ? (
            <p className="px-5 py-8 text-sm text-zinc-600">No line items found on orders.</p>
          ) : (
            <table className="w-full min-w-[480px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-3" scope="col">
                    Product
                  </th>
                  <th className="px-5 py-3 text-right" scope="col">
                    Qty
                  </th>
                  <th className="px-5 py-3 text-right" scope="col">
                    Spent
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.title} className="border-b border-zinc-50">
                    <td className="px-5 py-3 font-medium text-zinc-900">{p.title}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-zinc-600">{p.qty}</td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums text-zinc-900">
                      {formatAdminMoney(p.spent, totals.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section id="activity" className={`${card} w-full min-w-0 p-0`}>
        <div className="border-b border-zinc-100 px-5 py-4">
          <h2 className={h2}>Activity log</h2>
        </div>
        <div className="w-full min-w-0 overflow-x-auto">
          {activities.length === 0 ? (
            <p className="px-5 py-8 text-sm text-zinc-600">
              No timeline events yet. Order milestones will appear here when present in Strapi.
            </p>
          ) : (
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="w-48 whitespace-nowrap px-5 py-3" scope="col">
                    When
                  </th>
                  <th className="px-5 py-3" scope="col">
                    Event
                  </th>
                </tr>
              </thead>
              <tbody>
                {activities.slice(0, 50).map((a, i) => (
                  <tr key={`${a.at}-${i}`} className="border-b border-zinc-50 align-top">
                    <td className="whitespace-nowrap px-5 py-3 text-zinc-500">
                      <time dateTime={a.at}>{formatAdminDate(a.at)}</time>
                    </td>
                    <td className="px-5 py-3 text-zinc-800">{a.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className={card}>
        <h2 className={h2}>Notes</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          Internal notes are not persisted in Strapi yet. When you add a <code className="rounded bg-zinc-100 px-1">notes</code>{" "}
          field (or connect a CRM), this panel can store staff-only context next to the customer record.
        </p>
      </section>
    </div>
  );
}
