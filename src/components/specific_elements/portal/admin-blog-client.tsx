"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, FileText, Plus, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "lib/utils";
import AdminRightDrawer from "components/specific_elements/portal/admin-right-drawer";
import AdminTablePagination from "components/specific_elements/portal/admin-table-pagination";
import { useAdminTablePagination } from "hooks/use-admin-table-pagination";
import DeleteConfirmDialog from "components/portal/delete-confirm-dialog";
import PendingDeleteUndoToast from "components/portal/pending-delete-undo-toast";
import { useDeleteWithUndo } from "hooks/useDeleteWithUndo";
import {
  extractRichTextBody,
  normalizeArticleBlocksFromApi,
  upsertRichTextBlock,
  type ArticleBlockEntry,
} from "lib/article-blocks";

export type ArticleRow = {
  id: number;
  title: string;
  slug: string;
  description: string;
  categoryId: number | null;
  imageUrl: string | null;
  /** Content blocks snapshot; main rich-text body is edited in the form. */
  blocksSnapshot: unknown[];
};

export type CategoryOption = { id: number; name: string };

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

function validateBlocksSnapshot(blocks: ArticleBlockEntry[]): string | null {
  for (const b of blocks) {
    if (b.__component === "shared.quote") {
      if (!(typeof b.body === "string" && b.body.trim())) {
        return "Each quote block needs quote text (or remove the block).";
      }
    }
    if (b.__component === "shared.video-embed") {
      if (!(typeof b.url === "string" && b.url.trim())) {
        return "Each video block needs a URL (or remove the block).";
      }
    }
    if (b.__component === "shared.media") {
      if (typeof b.file !== "number") {
        return "Each image block needs an uploaded file (or remove the block).";
      }
    }
    if (b.__component === "shared.slider") {
      if (!Array.isArray(b.files) || (b.files as number[]).length === 0) {
        return "Each slider needs at least one image (or remove the block).";
      }
    }
  }
  return null;
}

function blockLabel(c: string | undefined): string {
  switch (c) {
    case "shared.quote":
      return "Quote";
    case "shared.video-embed":
      return "Video embed";
    case "shared.media":
      return "Image";
    case "shared.slider":
      return "Image slider";
    default:
      return c || "Block";
  }
}

export default function AdminBlogClient({
  articles,
  categories,
}: {
  articles: ArticleRow[];
  categories: CategoryOption[];
}) {
  const postsPag = useAdminTablePagination(articles, [articles.length]);
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");
  const [editing, setEditing] = useState<ArticleRow | null>(null);
  const editingRef = useRef<ArticleRow | null>(null);
  editingRef.current = editing;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  /** Full ordered dynamic zone (rich-text + quotes, media, …). */
  const [blocksSnapshot, setBlocksSnapshot] = useState<ArticleBlockEntry[]>([]);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setSlug("");
    setCategoryId("");
    setBlocksSnapshot([]);
    setCoverFile(null);
    setRemoveCover(false);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    setEditing(null);
    setError("");
    setListError("");
  }

  async function executeArticleDelete(a: ArticleRow) {
    setDeletingId(a.id);
    setListError("");
    try {
      const res = await fetch(`/api/admin/articles/${a.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Delete failed");
      }
      if (editingRef.current?.id === a.id) {
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

  const articleDelete = useDeleteWithUndo<ArticleRow>({
    onExecuteDelete: executeArticleDelete,
  });

  function openCreate() {
    resetForm();
    setDrawerOpen(true);
  }

  function startEdit(a: ArticleRow) {
    setEditing(a);
    setTitle(a.title);
    setDescription(a.description);
    setSlug(a.slug || "");
    setCategoryId(a.categoryId ? String(a.categoryId) : "");
    const snap = normalizeArticleBlocksFromApi(a.blocksSnapshot || []);
    setBlocksSnapshot(snap);
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

  function patchBlockAt(index: number, patch: Partial<ArticleBlockEntry>) {
    setBlocksSnapshot((prev) => {
      const next = [...prev];
      const cur = next[index];
      if (!cur) return prev;
      next[index] = { ...cur, ...patch };
      return next;
    });
  }

  function moveBlock(from: number, to: number) {
    setBlocksSnapshot((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }

  function removeBlockAt(index: number) {
    setBlocksSnapshot((prev) => prev.filter((_, j) => j !== index));
  }

  function appendBlock(block: ArticleBlockEntry) {
    setBlocksSnapshot((prev) => [...prev, block]);
  }

  async function addSliderFiles(index: number, files: FileList | null) {
    if (!files?.length) return;
    const ids = await Promise.all(Array.from(files).map((f) => uploadCoverFile(f)));
    setBlocksSnapshot((prev) => {
      const next = [...prev];
      const cur = next[index];
      if (!cur || cur.__component !== "shared.slider") return prev;
      const existing = Array.isArray(cur.files) ? (cur.files as number[]) : [];
      next[index] = { ...cur, files: [...existing, ...ids] };
      return next;
    });
  }

  async function onMediaBlockFile(index: number, file: File | null) {
    if (!file) return;
    const id = await uploadCoverFile(file);
    patchBlockAt(index, { file: id });
  }

  const bodyRichText = extractRichTextBody(blocksSnapshot);

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const blockErr = validateBlocksSnapshot(blocksSnapshot);
      if (blockErr) {
        setError(blockErr);
        setBusy(false);
        return;
      }
      const blocks = blocksSnapshot;
      let coverId: number | undefined;
      if (coverFile) {
        coverId = await uploadCoverFile(coverFile);
      }
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          blocks,
          ...(slug ? { slug } : {}),
          ...(categoryId ? { category: Number(categoryId) } : {}),
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
      const blockErr = validateBlocksSnapshot(blocksSnapshot);
      if (blockErr) {
        setError(blockErr);
        setBusy(false);
        return;
      }
      const blocks = blocksSnapshot;
      const payload: Record<string, unknown> = {
        title,
        description,
        ...(slug ? { slug } : {}),
        category: categoryId ? Number(categoryId) : null,
        blocks,
      };
      if (removeCover) {
        payload.cover = null;
      } else if (coverFile) {
        payload.cover = await uploadCoverFile(coverFile);
      }

      const res = await fetch(`/api/admin/articles/${editing.id}`, {
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

  const displayCoverUrl =
    removeCover && editing ? null : filePreview || editing?.imageUrl || null;

  const categoryName = (id: number | null) =>
    id == null ? "—" : categories.find((c) => c.id === id)?.name ?? `#${id}`;

  return (
    <div className="space-y-6">
      <AdminRightDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        size="wide"
        title={editing ? `Edit post #${editing.id}` : "New blog post"}
        description="Cover, main body (HTML), and optional blocks. Block order matches the published post."
      >
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={editing ? submitEdit : submitCreate}>
          <div className="sm:col-span-2 flex flex-wrap items-start gap-4">
            <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100">
              {displayCoverUrl ? (
                <Image
                  src={displayCoverUrl}
                  alt={title || "Cover"}
                  fill
                  className="object-cover"
                  sizes="176px"
                  unoptimized={
                    displayCoverUrl.startsWith("blob:") ||
                    displayCoverUrl.includes("localhost") ||
                    displayCoverUrl.includes("127.0.0.1")
                  }
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-zinc-400">
                  <FileText className="h-8 w-8" strokeWidth={1.5} aria-hidden />
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

          <label className="sm:col-span-2 block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Title</span>
            <input
              className={input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label className="sm:col-span-2 block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Excerpt / description</span>
            <textarea
              className={cn(input, "min-h-[72px] resize-y")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={256}
            />
          </label>
          <label className="sm:col-span-2 block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Article body (HTML)</span>
            <textarea
              className={cn(input, "min-h-[200px] resize-y font-mono text-[13px]")}
              value={bodyRichText}
              onChange={(e) =>
                setBlocksSnapshot((prev) => upsertRichTextBlock(prev, e.target.value))
              }
              placeholder="<p>HTML for the main rich-text block…</p>"
            />
          </label>

          <div className="sm:col-span-2 space-y-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-800">Content blocks</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    appendBlock({
                      __component: "shared.quote",
                      title: "",
                      body: "",
                      author: "",
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  <PlusCircle className="h-3.5 w-3.5" aria-hidden />
                  Quote
                </button>
                <button
                  type="button"
                  onClick={() => appendBlock({ __component: "shared.video-embed", url: "" })}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  <PlusCircle className="h-3.5 w-3.5" aria-hidden />
                  Video
                </button>
                <button
                  type="button"
                  onClick={() => appendBlock({ __component: "shared.media", file: null })}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  <PlusCircle className="h-3.5 w-3.5" aria-hidden />
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => appendBlock({ __component: "shared.slider", files: [] })}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  <PlusCircle className="h-3.5 w-3.5" aria-hidden />
                  Slider
                </button>
              </div>
            </div>
            <ul className="space-y-3">
              {blocksSnapshot
                .map((block, i) => ({ block, i }))
                .filter(({ block }) => block.__component !== "shared.rich-text")
                .map(({ block, i }) => {
                const comp = block.__component;
                return (
                  <li
                    key={`${comp}-${i}`}
                    className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                        {blockLabel(comp)}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          aria-label="Move block up"
                          onClick={() => moveBlock(i, i - 1)}
                          disabled={i === 0}
                          className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Move block down"
                          onClick={() => moveBlock(i, i + 1)}
                          disabled={i >= blocksSnapshot.length - 1}
                          className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Remove block"
                          onClick={() => removeBlockAt(i)}
                          className="rounded p-1 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {comp === "shared.quote" ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="block space-y-1 sm:col-span-2">
                          <span className="text-[11px] font-medium text-zinc-600">Quote text</span>
                          <textarea
                            className={cn(input, "min-h-[72px] resize-y text-[13px]")}
                            value={typeof block.body === "string" ? block.body : ""}
                            onChange={(e) => patchBlockAt(i, { body: e.target.value })}
                            required
                          />
                        </label>
                        <label className="block space-y-1">
                          <span className="text-[11px] font-medium text-zinc-600">Title (optional)</span>
                          <input
                            className={input}
                            value={typeof block.title === "string" ? block.title : ""}
                            onChange={(e) => patchBlockAt(i, { title: e.target.value })}
                          />
                        </label>
                        <label className="block space-y-1">
                          <span className="text-[11px] font-medium text-zinc-600">Author (optional)</span>
                          <input
                            className={input}
                            value={typeof block.author === "string" ? block.author : ""}
                            onChange={(e) => patchBlockAt(i, { author: e.target.value })}
                          />
                        </label>
                      </div>
                    ) : null}
                    {comp === "shared.video-embed" ? (
                      <label className="block space-y-1">
                        <span className="text-[11px] font-medium text-zinc-600">Video URL</span>
                        <input
                          className={input}
                          type="url"
                          placeholder="https://…"
                          value={typeof block.url === "string" ? block.url : ""}
                          onChange={(e) => patchBlockAt(i, { url: e.target.value })}
                        />
                      </label>
                    ) : null}
                    {comp === "shared.media" ? (
                      <div className="space-y-1">
                        <span className="text-[11px] font-medium text-zinc-600">Image file</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            e.target.value = "";
                            if (f) void onMediaBlockFile(i, f);
                          }}
                        />
                        {typeof block.file === "number" ? (
                          <p className="text-[11px] text-zinc-500">Uploaded media id: {block.file}</p>
                        ) : null}
                      </div>
                    ) : null}
                    {comp === "shared.slider" ? (
                      <div className="space-y-2">
                        <span className="text-[11px] font-medium text-zinc-600">Slider images</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                          onChange={(e) => {
                            const list = e.target.files;
                            e.target.value = "";
                            if (list?.length) void addSliderFiles(i, list);
                          }}
                        />
                        {Array.isArray(block.files) && (block.files as number[]).length > 0 ? (
                          <p className="text-[11px] text-zinc-500">
                            {(block.files as number[]).length} image(s) — ids:{" "}
                            {(block.files as number[]).join(", ")}
                          </p>
                        ) : (
                          <p className="text-[11px] text-zinc-400">No images yet.</p>
                        )}
                        {Array.isArray(block.files) && (block.files as number[]).length > 0 ? (
                          <button
                            type="button"
                            onClick={() => patchBlockAt(i, { files: [] })}
                            className="text-[11px] font-medium text-red-600 hover:text-red-700"
                          >
                            Clear slider images
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {!blocksSnapshot.some((b) => b.__component === "shared.rich-text") && !bodyRichText ? (
              <p className="text-[11px] text-zinc-400">
                Tip: fill <strong className="font-medium text-zinc-500">Article body</strong> to add the
                main rich-text block; you can still add quotes or media above/below by reordering blocks.
              </p>
            ) : null}
          </div>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Slug (optional)</span>
            <input className={input} value={slug} onChange={(e) => setSlug(e.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Category</span>
            <select
              className={input}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {busy ? "Saving…" : editing ? "Save changes" : "Create post"}
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
          <FileText className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">Posts</h2>
          <span className="text-xs text-zinc-500">{postsPag.totalCount} total</span>
          <button
            type="button"
            onClick={openCreate}
            disabled={
              deletingId != null || articleDelete.toastOpen || articleDelete.dialogOpen || drawerOpen
            }
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            New post
          </button>
        </div>
        {listError ? <p className="px-4 py-2 text-sm text-red-600">{listError}</p> : null}
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse bg-white text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3 w-24">Cover</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Blocks</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                    No posts yet. Use <span className="font-medium text-zinc-700">New post</span>.
                  </td>
                </tr>
              ) : (
                postsPag.pageItems.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/60"
                  >
                    <td className="px-4 py-3">
                      <div className="relative h-11 w-16 overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-100">
                        {a.imageUrl ? (
                          <Image
                            src={a.imageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized={
                              a.imageUrl.includes("localhost") || a.imageUrl.includes("127.0.0.1")
                            }
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-zinc-400">
                            <FileText className="h-4 w-4" aria-hidden />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="max-w-[220px] px-4 py-3">
                      <p className="truncate font-medium text-zinc-900">{a.title}</p>
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-zinc-600">
                      /{a.slug || "—"}
                    </td>
                    <td className="max-w-[140px] truncate px-4 py-3 text-zinc-600">
                      {categoryName(a.categoryId)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-800">
                      {a.blocksSnapshot?.length ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(a)}
                          disabled={
                            deletingId != null ||
                            articleDelete.toastOpen ||
                            articleDelete.dialogOpen
                          }
                          className="inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => articleDelete.openConfirm(a)}
                          disabled={
                            deletingId != null ||
                            articleDelete.toastOpen ||
                            articleDelete.dialogOpen
                          }
                          className="inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-lg border border-red-200 bg-white px-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === a.id ? "…" : "Delete"}
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
          totalCount={postsPag.totalCount}
          page={postsPag.page}
          totalPages={postsPag.totalPages}
          pageSize={postsPag.pageSize}
          rangeFrom={postsPag.rangeFrom}
          rangeTo={postsPag.rangeTo}
          onPageChange={postsPag.setPage}
          onPageSizeChange={postsPag.setPageSize}
        />
      </div>
      <DeleteConfirmDialog
        open={articleDelete.dialogOpen}
        onOpenChange={articleDelete.onDialogOpenChange}
        title={
          articleDelete.pendingItem
            ? `Delete post “${articleDelete.pendingItem.title}”?`
            : "Delete post?"
        }
        description="This removes the article from Strapi. After you confirm, you can still undo until the countdown finishes."
        onConfirm={articleDelete.confirmDelete}
      />
      <PendingDeleteUndoToast
        open={articleDelete.toastOpen}
        message={
          articleDelete.pendingItem
            ? `“${articleDelete.pendingItem.title}” will be permanently deleted.`
            : "The post will be permanently deleted."
        }
        secondsLeft={articleDelete.secondsLeft}
        onUndo={articleDelete.undo}
      />
    </div>
  );
}
