"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Eye, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import AdminRightDrawer from "components/specific_elements/portal/admin-right-drawer";
import type { AddressBookRow } from "lib/account-address-book";
import { cn } from "lib/utils";
import { useAdminTablePagination } from "hooks/use-admin-table-pagination";
import AdminTablePagination from "components/specific_elements/portal/admin-table-pagination";

const emptyForm = {
  label: "Home",
  receiverName: "",
  phone: "",
  province: "",
  city: "",
  postalCode: "",
  addressLine1: "",
  addressLine2: "",
  isDefault: false,
};

const input =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800";

function formatAddressSummary(a: AddressBookRow): string {
  const parts = [a.province, a.city, a.postalCode].filter(Boolean).join(", ");
  const line = a.addressLine1
    ? a.addressLine1.length > 40
      ? `${a.addressLine1.slice(0, 40)}…`
      : a.addressLine1
    : "—";
  return parts ? `${parts} · ${line}` : line;
}

export default function AddressBookClient() {
  const [addresses, setAddresses] = useState<AddressBookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewRow, setPreviewRow] = useState<AddressBookRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const addrPag = useAdminTablePagination(addresses, [addresses.length]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account/addresses", { credentials: "include" });
      if (res.status === 401) {
        setNeedsAuth(true);
        setAddresses([]);
        return;
      }
      setNeedsAuth(false);
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "Could not load addresses");
      }
      const data = (await res.json()) as { addresses?: AddressBookRow[] };
      setAddresses(data.addresses || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load addresses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setDrawerOpen(true);
    setError(null);
  }

  function openEdit(row: AddressBookRow) {
    setEditingId(row.id);
    setForm({
      label: row.label || "Home",
      receiverName: row.receiverName,
      phone: row.phone,
      province: row.province,
      city: row.city,
      postalCode: row.postalCode,
      addressLine1: row.addressLine1,
      addressLine2: row.addressLine2 || "",
      isDefault: row.isDefault,
    });
    setDrawerOpen(true);
    setError(null);
  }

  function handleDrawerChange(open: boolean) {
    setDrawerOpen(open);
    if (!open) {
      setEditingId(null);
      setForm({ ...emptyForm });
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = {
        label: form.label.trim() || "Home",
        receiverName: form.receiverName.trim(),
        phone: form.phone.trim(),
        province: form.province.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || undefined,
        isDefault: form.isDefault,
      };

      const url =
        editingId != null ? `/api/account/addresses/${editingId}` : "/api/account/addresses";
      const method = editingId != null ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error || "Save failed");
      }
      handleDrawerChange(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: number) {
    if (!window.confirm("Delete this address?")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(j.error || "Delete failed");
      }
      if (editingId === id) handleDrawerChange(false);
      if (previewRow?.id === id) setPreviewRow(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  if (needsAuth) {
    return (
      <p className="text-sm text-zinc-600">
        <Link href="/auth" className="font-medium text-emerald-700 underline">
          Sign in
        </Link>{" "}
        to manage your shipping addresses.
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading addresses…</p>;
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <AdminRightDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerChange}
        title={editingId != null ? `Edit address #${editingId}` : "New address"}
        description="Used at checkout. Mark one address as default if you like."
      >
        <form onSubmit={(e) => void onSubmit(e)} className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-medium text-zinc-600">Label</span>
            <input
              className={cn(input, "mt-1")}
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="Home, Work…"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-medium text-zinc-600">Recipient name</span>
            <input
              required
              className={cn(input, "mt-1")}
              value={form.receiverName}
              onChange={(e) => setForm((f) => ({ ...f, receiverName: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-zinc-600">Phone</span>
            <input
              required
              className={cn(input, "mt-1")}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-zinc-600">Postal code</span>
            <input
              required
              className={cn(input, "mt-1")}
              value={form.postalCode}
              onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-zinc-600">Province / state</span>
            <input
              required
              className={cn(input, "mt-1")}
              value={form.province}
              onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="text-xs font-medium text-zinc-600">City</span>
            <input
              required
              className={cn(input, "mt-1")}
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-medium text-zinc-600">Address line 1</span>
            <input
              required
              className={cn(input, "mt-1")}
              value={form.addressLine1}
              onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-xs font-medium text-zinc-600">Address line 2 (optional)</span>
            <input
              className={cn(input, "mt-1")}
              value={form.addressLine2}
              onChange={(e) => setForm((f) => ({ ...f, addressLine2: e.target.value }))}
            />
          </label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="rounded border-zinc-300"
            />
            <span className="text-zinc-700">Use as default shipping address</span>
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save address"}
            </button>
            <button
              type="button"
              onClick={() => handleDrawerChange(false)}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminRightDrawer>

      <AdminRightDrawer
        open={previewRow != null}
        onOpenChange={(open) => {
          if (!open) setPreviewRow(null);
        }}
        title={previewRow?.label || "Address"}
        description={previewRow ? "Full shipping details" : undefined}
      >
        {previewRow ? (
          <div className="space-y-2 text-sm text-zinc-800">
            <p className="font-medium text-zinc-900">
              {previewRow.receiverName} — {previewRow.phone}
            </p>
            <p>
              {previewRow.province}, {previewRow.city} {previewRow.postalCode}
            </p>
            <p>{previewRow.addressLine1}</p>
            {previewRow.addressLine2 ? <p>{previewRow.addressLine2}</p> : null}
            {previewRow.isDefault ? (
              <p className="pt-2 text-xs font-semibold text-emerald-700">Default address</p>
            ) : null}
          </div>
        ) : null}
      </AdminRightDrawer>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => openCreate()}
          disabled={drawerOpen}
          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add address
        </button>
      </div>

      <div className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-4 py-3">
          <MapPin className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">Saved addresses</h2>
          <span className="text-xs text-zinc-500">{addrPag.totalCount} total</span>
        </div>
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse bg-white text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3" scope="col">
                  Label
                </th>
                <th className="px-4 py-3" scope="col">
                  Recipient
                </th>
                <th className="px-4 py-3" scope="col">
                  Phone
                </th>
                <th className="px-4 py-3" scope="col">
                  Location
                </th>
                <th className="px-4 py-3" scope="col">
                  Default
                </th>
                <th className="px-4 py-3 text-right" scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {addresses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                    No saved addresses yet. Use <span className="font-medium text-zinc-700">Add address</span>{" "}
                    for checkout.
                  </td>
                </tr>
              ) : (
                addrPag.pageItems.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/60"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">{a.label || "Address"}</td>
                    <td className="max-w-[140px] truncate px-4 py-3 text-zinc-800">{a.receiverName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-600">{a.phone}</td>
                    <td className="max-w-[240px] px-4 py-3">
                      <span className="line-clamp-2 text-zinc-600" title={formatAddressSummary(a)}>
                        {formatAddressSummary(a)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {a.isDefault ? (
                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                          Yes
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="View"
                          onClick={() => setPreviewRow(a)}
                          className={iconBtn}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => openEdit(a)}
                          disabled={drawerOpen}
                          className={iconBtn}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          disabled={deletingId === a.id}
                          onClick={() => void onDelete(a.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
