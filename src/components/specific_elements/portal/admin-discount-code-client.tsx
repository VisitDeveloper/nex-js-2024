"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DeleteConfirmDialog from "components/portal/delete-confirm-dialog";
import PendingDeleteUndoToast from "components/portal/pending-delete-undo-toast";
import { useDeleteWithUndo } from "hooks/useDeleteWithUndo";
import { cn } from "lib/utils";
import AdminRightDrawer from "components/specific_elements/portal/admin-right-drawer";
import AdminTablePagination from "components/specific_elements/portal/admin-table-pagination";
import { useAdminTablePagination } from "hooks/use-admin-table-pagination";
import { Plus, TicketPercent } from "lucide-react";

export type DiscountCodeRow = {
  id: number;
  code: string;
  label: string;
  discountType: string;
  amount: number;
  isActive: boolean;
  minSubtotal: number;
  maxRedemptions: number | null;
  redemptionCount: number;
  startsAt: string | null;
  endsAt: string | null;
};

const input =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

function mapRow(raw: any): DiscountCodeRow {
  const a = raw.attributes ?? {};
  return {
    id: raw.id,
    code: a.code ?? "",
    label: a.label ?? "",
    discountType: a.discountType ?? "percent",
    amount: Number(a.amount) || 0,
    isActive: Boolean(a.isActive ?? true),
    minSubtotal: Number(a.minSubtotal) || 0,
    maxRedemptions: a.maxRedemptions != null ? Number(a.maxRedemptions) : null,
    redemptionCount: Number(a.redemptionCount) || 0,
    startsAt: a.startsAt ?? null,
    endsAt: a.endsAt ?? null,
  };
}

export default function AdminDiscountCodeClient() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rows, setRows] = useState<DiscountCodeRow[]>([]);
  const [loadErr, setLoadErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const editingIdRef = useRef<number | null>(null);
  editingIdRef.current = editingId;
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [amount, setAmount] = useState("10");
  const [minSubtotal, setMinSubtotal] = useState("0");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const codesPag = useAdminTablePagination(rows, [rows.length]);

  async function load() {
    setLoadErr("");
    try {
      const res = await fetch("/api/admin/discount-codes", { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Load failed");
      const list = (json.data ?? []).map(mapRow);
      setRows(list);
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : "Load failed");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function executeDiscountDelete(r: DiscountCodeRow) {
    setDeletingId(r.id);
    setLoadErr("");
    try {
      const res = await fetch(`/api/admin/discount-codes/${r.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Delete failed");
      }
      if (editingIdRef.current === r.id) {
        resetForm();
        setDrawerOpen(false);
      }
      await load();
      router.refresh();
    } catch (err) {
      setLoadErr(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  const discountDelete = useDeleteWithUndo<DiscountCodeRow>({
    onExecuteDelete: executeDiscountDelete,
  });

  function resetForm() {
    setEditingId(null);
    setCode("");
    setLabel("");
    setDiscountType("percent");
    setAmount("10");
    setMinSubtotal("0");
    setMaxRedemptions("");
    setIsActive(true);
    setStartsAt("");
    setEndsAt("");
    setFormErr("");
  }

  function openCreate() {
    resetForm();
    setDrawerOpen(true);
  }

  function startEdit(r: DiscountCodeRow) {
    setEditingId(r.id);
    setCode(r.code);
    setLabel(r.label);
    setDiscountType(r.discountType === "fixed" ? "fixed" : "percent");
    setAmount(String(r.amount));
    setMinSubtotal(String(r.minSubtotal));
    setMaxRedemptions(r.maxRedemptions != null ? String(r.maxRedemptions) : "");
    setIsActive(r.isActive);
    setStartsAt(r.startsAt ? r.startsAt.slice(0, 16) : "");
    setEndsAt(r.endsAt ? r.endsAt.slice(0, 16) : "");
    setFormErr("");
    setDrawerOpen(true);
  }

  function handleDrawerOpenChange(next: boolean) {
    setDrawerOpen(next);
    if (!next) resetForm();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormErr("");
    try {
      const payload: Record<string, unknown> = {
        discountType,
        amount: Number(amount),
        isActive,
        minSubtotal: Number(minSubtotal) || 0,
        maxRedemptions: maxRedemptions.trim() ? Number(maxRedemptions) : null,
        startsAt: startsAt.trim() ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt.trim() ? new Date(endsAt).toISOString() : null,
      };
      if (label.trim()) payload.label = label.trim();
      else payload.label = null;

      if (editingId != null) {
        const res = await fetch(`/api/admin/discount-codes/${editingId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || "Update failed");
      } else {
        if (!code.trim()) throw new Error("Code is required");
        const res = await fetch("/api/admin/discount-codes", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: code.trim(),
            label: label.trim() || undefined,
            discountType,
            amount: Number(amount),
            isActive,
            minSubtotal: Number(minSubtotal) || 0,
            maxRedemptions: maxRedemptions.trim() ? Number(maxRedemptions) : null,
            startsAt: startsAt.trim() ? new Date(startsAt).toISOString() : null,
            endsAt: endsAt.trim() ? new Date(endsAt).toISOString() : null,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || "Create failed");
      }
      resetForm();
      setDrawerOpen(false);
      await load();
      router.refresh();
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminRightDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        title={editingId != null ? `Edit code #${editingId}` : "New discount code"}
        description="Codes apply at Stripe Checkout. Amounts use the same minor unit as cart line items."
      >
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
          <label className="space-y-1">
            <span className="text-xs font-medium text-zinc-600">Code</span>
            <input
              className={input}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SUMMER20"
              required={editingId == null}
              disabled={editingId != null}
            />
            {editingId != null ? (
              <span className="text-[10px] text-zinc-400">Code cannot be changed when editing.</span>
            ) : null}
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-zinc-600">Label (optional)</span>
            <input className={input} value={label} onChange={(e) => setLabel(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-zinc-600">Type</span>
            <select
              className={input}
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
            >
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount off (same unit as cart / Stripe cents)</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-zinc-600">
              Amount {discountType === "percent" ? "(%)" : "(cents)"}
            </span>
            <input
              className={input}
              type="number"
              min={0}
              step={discountType === "percent" ? 1 : 1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-zinc-600">Min subtotal (cents)</span>
            <input
              className={input}
              type="number"
              min={0}
              value={minSubtotal}
              onChange={(e) => setMinSubtotal(e.target.value)}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-zinc-600">Max redemptions (empty = ∞)</span>
            <input
              className={input}
              type="number"
              min={1}
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
              placeholder="—"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-zinc-600">Starts at (local)</span>
            <input
              className={input}
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-zinc-600">Ends at (local)</span>
            <input
              className={input}
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-zinc-300"
            />
            <span className="text-sm text-zinc-700">Active</span>
          </label>
          {formErr ? <p className="sm:col-span-2 text-sm text-red-600">{formErr}</p> : null}
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {busy ? "Saving…" : editingId != null ? "Save changes" : "Create code"}
            </button>
            <button
              type="button"
              onClick={() => handleDrawerOpenChange(false)}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminRightDrawer>

      <div className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-4 py-3">
          <TicketPercent className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">Discount codes</h2>
          <span className="text-xs text-zinc-500">{codesPag.totalCount} total</span>
          <button
            type="button"
            onClick={openCreate}
            disabled={
              deletingId != null ||
              discountDelete.toastOpen ||
              discountDelete.dialogOpen ||
              drawerOpen
            }
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            New code
          </button>
        </div>
        {loadErr ? <p className="px-4 py-2 text-sm text-red-600">{loadErr}</p> : null}
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse bg-white text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3 text-right">Used</th>
                <th className="px-4 py-3 text-right">Min subtotal</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loadErr ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    No discount codes yet. Use <span className="font-medium text-zinc-700">New code</span>.
                  </td>
                </tr>
              ) : (
                codesPag.pageItems.map((r) => (
                  <tr
                    key={r.id}
                    className={cn(
                      "border-b border-zinc-50 transition-colors hover:bg-zinc-50/60",
                      !r.isActive && "bg-zinc-50/80 text-zinc-600"
                    )}
                  >
                    <td className="px-4 py-3 font-semibold text-zinc-900">{r.code}</td>
                    <td className="max-w-[140px] truncate px-4 py-3 text-zinc-600">
                      {r.label || "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-800">
                      {r.discountType === "percent" ? `${r.amount}%` : `${r.amount}¢ off`}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-800">
                      {r.redemptionCount}
                      {r.maxRedemptions != null ? ` / ${r.maxRedemptions}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-600">{r.minSubtotal}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                          r.isActive ? "bg-emerald-50 text-emerald-800" : "bg-zinc-200 text-zinc-600"
                        )}
                      >
                        {r.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(r)}
                          disabled={
                            deletingId != null ||
                            discountDelete.toastOpen ||
                            discountDelete.dialogOpen
                          }
                          className="inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => discountDelete.openConfirm(r)}
                          disabled={
                            deletingId != null ||
                            discountDelete.toastOpen ||
                            discountDelete.dialogOpen
                          }
                          className="inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-lg border border-red-200 bg-white px-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === r.id ? "…" : "Delete"}
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
          totalCount={codesPag.totalCount}
          page={codesPag.page}
          totalPages={codesPag.totalPages}
          pageSize={codesPag.pageSize}
          rangeFrom={codesPag.rangeFrom}
          rangeTo={codesPag.rangeTo}
          onPageChange={codesPag.setPage}
          onPageSizeChange={codesPag.setPageSize}
        />
      </div>
      <DeleteConfirmDialog
        open={discountDelete.dialogOpen}
        onOpenChange={discountDelete.onDialogOpenChange}
        title={
          discountDelete.pendingItem
            ? `Delete code “${discountDelete.pendingItem.code}”?`
            : "Delete discount code?"
        }
        description="This removes the code from Strapi. After you confirm, you can still undo until the countdown finishes."
        onConfirm={discountDelete.confirmDelete}
      />
      <PendingDeleteUndoToast
        open={discountDelete.toastOpen}
        message={
          discountDelete.pendingItem
            ? `“${discountDelete.pendingItem.code}” will be permanently deleted.`
            : "The discount code will be permanently deleted."
        }
        secondsLeft={discountDelete.secondsLeft}
        onUndo={discountDelete.undo}
      />
    </div>
  );
}
