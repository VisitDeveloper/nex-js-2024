"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import DeleteConfirmDialog from "components/portal/delete-confirm-dialog";
import PendingDeleteUndoToast from "components/portal/pending-delete-undo-toast";
import { useDeleteWithUndo } from "hooks/useDeleteWithUndo";
import { FolderTree, Plus } from "lucide-react";
import { cn } from "lib/utils";
import AdminRightDrawer from "components/specific_elements/portal/admin-right-drawer";
import AdminTablePagination from "components/specific_elements/portal/admin-table-pagination";
import { useAdminTablePagination } from "hooks/use-admin-table-pagination";

export type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
};

const input =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

async function uploadCoverFile(file: File): Promise<number> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || "Upload failed");
  }
  if (typeof json.id !== "number") {
    throw new Error("Invalid upload response");
  }
  return json.id;
}

const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800";

export default function AdminCategoryClient({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const catPag = useAdminTablePagination(categories, [categories.length]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const editingRef = useRef<CategoryRow | null>(null);
  editingRef.current = editing;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  async function executeCategoryDelete(c: CategoryRow) {
    setDeletingId(c.id);
    setListError("");
    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Delete failed");
      }
      if (editingRef.current?.id === c.id) {
        resetForm();
        setDrawerOpen(false);
      }
      router.refresh();
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  const categoryDelete = useDeleteWithUndo<CategoryRow>({
    onExecuteDelete: executeCategoryDelete,
  });

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  function resetForm() {
    setName("");
    setSlug("");
    setDescription("");
    setCoverFile(null);
    setRemoveCover(false);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    setEditing(null);
    setError("");
    setListError("");
  }

  function openCreate() {
    resetForm();
    setDrawerOpen(true);
  }

  function startEdit(c: CategoryRow) {
    setEditing(c);
    setName(c.name);
    setSlug(c.slug || "");
    setDescription(c.description || "");
    setCoverFile(null);
    setRemoveCover(false);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    setError("");
    setListError("");
    setDrawerOpen(true);
  }

  function handleDrawerOpenChange(next: boolean) {
    setDrawerOpen(next);
    if (!next) resetForm();
  }

  function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    setRemoveCover(false);
    if (!f) {
      setCoverFile(null);
      return;
    }
    setCoverFile(f);
    setFilePreview(URL.createObjectURL(f));
    e.target.value = "";
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      let coverId: number | undefined;
      if (coverFile) {
        coverId = await uploadCoverFile(coverFile);
      }
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ...(slug ? { slug } : {}),
          ...(description ? { description } : {}),
          ...(coverId != null ? { cover: coverId } : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Create failed");
      }
      resetForm();
      setDrawerOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        name,
        ...(slug ? { slug } : {}),
        ...(description ? { description } : {}),
      };
      if (removeCover) {
        payload.cover = null;
      } else if (coverFile) {
        payload.cover = await uploadCoverFile(coverFile);
      }

      const res = await fetch(`/api/admin/categories/${editing.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Update failed");
      }
      resetForm();
      setDrawerOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  const displayImageUrl =
    removeCover && editing ? null : filePreview || editing?.imageUrl || null;

  return (
    <div className="space-y-6">
      <AdminRightDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        title={editing ? `Edit category #${editing.id}` : "New category"}
        description="Optional cover image. Used in admin and wherever the storefront shows category imagery."
      >
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={editing ? submitEdit : submitCreate}>
          <div className="sm:col-span-2 flex flex-wrap items-start gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100">
              {displayImageUrl ? (
                <Image
                  src={displayImageUrl}
                  alt={name || "Cover preview"}
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={
                    displayImageUrl.startsWith("blob:") ||
                    displayImageUrl.includes("localhost") ||
                    displayImageUrl.includes("127.0.0.1")
                  }
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-zinc-400">
                  <FolderTree className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <label className="block">
                <span className="text-xs font-medium text-zinc-600">Cover image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPickCover}
                  className="mt-1 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-zinc-800"
                />
              </label>
              {editing && (editing.imageUrl || coverFile) && !removeCover ? (
                <button
                  type="button"
                  onClick={() => {
                    setRemoveCover(true);
                    setCoverFile(null);
                    if (filePreview) URL.revokeObjectURL(filePreview);
                    setFilePreview(null);
                  }}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Remove cover
                </button>
              ) : null}
              {editing && removeCover ? (
                <button
                  type="button"
                  onClick={() => setRemoveCover(false)}
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-800"
                >
                  Undo remove
                </button>
              ) : null}
            </div>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Name</span>
            <input
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Slug (optional)</span>
            <input className={input} value={slug} onChange={(e) => setSlug(e.target.value)} />
          </label>
          <label className="sm:col-span-2 block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Description</span>
            <textarea
              className={cn(input, "min-h-[72px] resize-y")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {busy ? "Saving…" : editing ? "Save category" : "Create category"}
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
          <FolderTree className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">Categories</h2>
          <span className="text-xs text-zinc-500">{catPag.totalCount} total</span>
          <button
            type="button"
            onClick={openCreate}
            disabled={
              deletingId != null || categoryDelete.toastOpen || categoryDelete.dialogOpen || drawerOpen
            }
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            New category
          </button>
        </div>
        {listError ? <p className="px-4 py-2 text-sm text-red-600">{listError}</p> : null}
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse bg-white text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3 w-16">Cover</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-zinc-500">
                    No categories yet. Use <span className="font-medium text-zinc-700">New category</span>{" "}
                    to add one.
                  </td>
                </tr>
              ) : (
                catPag.pageItems.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/60"
                  >
                    <td className="px-4 py-3">
                      <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-100">
                        {c.imageUrl ? (
                          <Image
                            src={c.imageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="44px"
                            unoptimized={
                              c.imageUrl.includes("localhost") || c.imageUrl.includes("127.0.0.1")
                            }
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-zinc-400">
                            <FolderTree className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900">{c.name}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-zinc-600">
                      {c.slug || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => startEdit(c)}
                          disabled={
                            deletingId != null ||
                            categoryDelete.toastOpen ||
                            categoryDelete.dialogOpen
                          }
                          className={cn(iconBtn, "w-auto min-w-[4.5rem] px-2 text-xs font-semibold")}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => categoryDelete.openConfirm(c)}
                          disabled={
                            deletingId != null ||
                            categoryDelete.toastOpen ||
                            categoryDelete.dialogOpen
                          }
                          className="inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-lg border border-red-200 bg-white px-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === c.id ? "…" : "Delete"}
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
          totalCount={catPag.totalCount}
          page={catPag.page}
          totalPages={catPag.totalPages}
          pageSize={catPag.pageSize}
          rangeFrom={catPag.rangeFrom}
          rangeTo={catPag.rangeTo}
          onPageChange={catPag.setPage}
          onPageSizeChange={catPag.setPageSize}
        />
      </div>
      <DeleteConfirmDialog
        open={categoryDelete.dialogOpen}
        onOpenChange={categoryDelete.onDialogOpenChange}
        title={
          categoryDelete.pendingItem
            ? `Delete category “${categoryDelete.pendingItem.name}”?`
            : "Delete category?"
        }
        description="This removes the category from Strapi. Linked products or articles may prevent deletion. After you confirm, you can still undo until the countdown finishes."
        onConfirm={categoryDelete.confirmDelete}
      />
      <PendingDeleteUndoToast
        open={categoryDelete.toastOpen}
        message={
          categoryDelete.pendingItem
            ? `“${categoryDelete.pendingItem.name}” will be permanently deleted.`
            : "The category will be permanently deleted."
        }
        secondsLeft={categoryDelete.secondsLeft}
        onUndo={categoryDelete.undo}
      />
    </div>
  );
}
