"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import DeleteConfirmDialog from "components/portal/delete-confirm-dialog";
import PendingDeleteUndoToast from "components/portal/pending-delete-undo-toast";
import { useDeleteWithUndo } from "hooks/useDeleteWithUndo";
import { Package, Plus } from "lucide-react";
import { cn } from "lib/utils";
import { parseMoney } from "lib/variant-pricing";
import AdminRightDrawer from "components/specific_elements/portal/admin-right-drawer";
import AdminTablePagination from "components/specific_elements/portal/admin-table-pagination";
import { useAdminTablePagination } from "hooks/use-admin-table-pagination";
import {
  PRODUCT_AGE_RANGE_KEYS,
  PRODUCT_AGE_RANGE_LABELS,
  type ProductAgeRangeKey,
} from "lib/product-age-range";
import {
  type ClientTutorialBlock,
  newBlockKey,
} from "lib/tutorial-blocks";

export type VariantInventoryRow = {
  variantId: number;
  title: string;
  sku: string;
  price: number;
  compareAtPrice: number;
  currency: string;
  inventoryId: number | null;
  onHand: number;
  reserved: number;
  available: number;
};

export type ProductRow = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  productType: string;
  /** Strapi `ageRange` enum or null */
  ageRange: string | null;
  categoryId: number | null;
  isActive: boolean;
  /** Extra per-order costs at product level (same currency convention as variants). */
  packagingPrice: number;
  shippingPrice: number;
  /** Absolute URL from cover or first gallery image */
  imageUrl: string | null;
  coverId: number | null;
  galleryIds: number[];
  variants: VariantInventoryRow[];
  /** Post-purchase tutorial blocks (locale en) */
  tutorialBlocks: ClientTutorialBlock[];
};

export type CategoryOption = { id: number; name: string };

const input =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

const PRODUCT_TYPES = [
  { value: "robot", label: "Robot" },
  { value: "robot-part", label: "Robot part" },
  { value: "three-d-print", label: "3D print" },
  { value: "accessory", label: "Accessory" },
] as const;

const AGE_RANGE_OPTIONS: { value: ProductAgeRangeKey; label: string }[] = PRODUCT_AGE_RANGE_KEYS.map(
  (key) => ({ value: key, label: PRODUCT_AGE_RANGE_LABELS[key] })
);

async function uploadImageFile(file: File): Promise<number> {
  return uploadAdminMediaFile(file);
}

async function uploadAdminMediaFile(file: File): Promise<number> {
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
  const id = json.id;
  if (typeof id !== "number") {
    throw new Error("Invalid upload response");
  }
  return id;
}

const stockBtn =
  "rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-50";

function VariantPricingControls({
  variant,
  onChanged,
}: {
  variant: VariantInventoryRow;
  onChanged: () => void;
}) {
  const [price, setPrice] = useState(String(variant.price));
  const [compareAt, setCompareAt] = useState(
    variant.compareAtPrice > 0 ? String(variant.compareAtPrice) : ""
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setPrice(String(variant.price));
    setCompareAt(variant.compareAtPrice > 0 ? String(variant.compareAtPrice) : "");
  }, [variant.variantId, variant.price, variant.compareAtPrice]);

  async function save() {
    const p = Number(price);
    if (Number.isNaN(p) || p < 0) {
      setErr("Invalid sale price");
      return;
    }
    const cRaw = compareAt.trim();
    const c = cRaw === "" ? 0 : Number(cRaw);
    if (Number.isNaN(c) || c < 0) {
      setErr("Invalid compare-at price");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/product-variants/${variant.variantId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: p, compareAtPrice: c }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to save prices");
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 space-y-1 border-t border-zinc-100 pt-2">
      <p className="text-[11px] font-semibold text-zinc-600">Pricing &amp; discount</p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-0.5 text-[11px] text-zinc-500">
          Sale price ({variant.currency})
          <input
            className={cn(input, "w-28 py-1 text-xs")}
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-0.5 text-[11px] text-zinc-500">
          Compare-at (optional)
          <input
            className={cn(input, "w-28 py-1 text-xs")}
            type="number"
            min={0}
            step="0.01"
            value={compareAt}
            onChange={(e) => setCompareAt(e.target.value)}
            placeholder="—"
          />
        </label>
        <button type="button" disabled={busy} onClick={() => void save()} className={stockBtn}>
          {busy ? "…" : "Save prices"}
        </button>
      </div>
      {err ? <p className="text-[11px] text-red-600">{err}</p> : null}
      <p className="text-[10px] leading-snug text-zinc-400">
        When compare-at is higher than sale price, the shop shows strikethrough + discount percent.
      </p>
    </div>
  );
}

function VariantIdentityControls({
  variant,
  onChanged,
}: {
  variant: VariantInventoryRow;
  onChanged: () => void;
}) {
  const [title, setTitle] = useState(variant.title);
  const [sku, setSku] = useState(variant.sku);
  const [currency, setCurrency] = useState<"USD" | "IRR">(
    variant.currency === "IRR" ? "IRR" : "USD"
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setTitle(variant.title);
    setSku(variant.sku);
    setCurrency(variant.currency === "IRR" ? "IRR" : "USD");
  }, [variant.variantId, variant.title, variant.sku, variant.currency]);

  async function save() {
    const t = title.trim();
    const s = sku.trim();
    if (!t || !s) {
      setErr("Title and SKU are required");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/product-variants/${variant.variantId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, sku: s, currency }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to save variant details");
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 space-y-1 border-t border-zinc-100 pt-2">
      <p className="text-[11px] font-semibold text-zinc-600">Variant details</p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-0.5 text-[11px] text-zinc-500">
          Title
          <input
            className={cn(input, "min-w-[140px] py-1 text-xs")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-0.5 text-[11px] text-zinc-500">
          SKU
          <input
            className={cn(input, "w-32 py-1 text-xs")}
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-0.5 text-[11px] text-zinc-500">
          Currency
          <select
            className={cn(input, "w-24 py-1 text-xs")}
            value={currency}
            onChange={(e) => setCurrency(e.target.value === "IRR" ? "IRR" : "USD")}
          >
            <option value="USD">USD</option>
            <option value="IRR">IRR</option>
          </select>
        </label>
        <button type="button" disabled={busy} onClick={() => void save()} className={stockBtn}>
          {busy ? "…" : "Save details"}
        </button>
      </div>
      {err ? <p className="text-[11px] text-red-600">{err}</p> : null}
    </div>
  );
}

function VariantStockControls({
  variant,
  onChanged,
}: {
  variant: VariantInventoryRow;
  onChanged: () => void;
}) {
  const [qty, setQty] = useState(variant.inventoryId == null ? "0" : "1");
  const [exactOnHand, setExactOnHand] = useState(String(variant.onHand));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setExactOnHand(String(variant.onHand));
  }, [variant.variantId, variant.onHand]);

  const parsedQty = () => Math.max(1, Math.floor(Number(qty) || 1));
  const parsedInitial = () => Math.max(0, Math.floor(Number(qty) || 0));

  async function createInv() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: variant.variantId, onHand: parsedInitial() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to create inventory");
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function patch(body: Record<string, unknown>) {
    if (variant.inventoryId == null) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/admin/inventory/${variant.inventoryId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Update failed");
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function setExact() {
    const n = Math.max(0, Math.floor(Number(exactOnHand) || 0));
    await patch({ setOnHand: n });
  }

  if (variant.inventoryId == null) {
    return (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-zinc-500">No inventory row — initial on-hand:</span>
        <input
          className={cn(input, "w-20 py-1 text-xs")}
          type="number"
          min={0}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
        <button type="button" disabled={busy} onClick={() => void createInv()} className={stockBtn}>
          {busy ? "…" : "Create stock"}
        </button>
        {err ? <span className="text-[11px] text-red-600">{err}</span> : null}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] text-zinc-500">Δ qty</span>
        <input
          className={cn(input, "w-16 py-1 text-xs")}
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
        <button type="button" disabled={busy} onClick={() => patch({ add: parsedQty() })} className={stockBtn}>
          Add
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => patch({ subtract: parsedQty() })}
          className={stockBtn}
        >
          Subtract
        </button>
        <button type="button" disabled={busy} onClick={() => patch({ outOfStock: true })} className={stockBtn}>
          Out of stock
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-1.5">
        <span className="text-[10px] text-zinc-500">Set total on-hand</span>
        <input
          className={cn(input, "w-20 py-1 text-xs")}
          type="number"
          min={0}
          step={1}
          value={exactOnHand}
          onChange={(e) => setExactOnHand(e.target.value)}
        />
        <button type="button" disabled={busy} onClick={() => void setExact()} className={stockBtn}>
          Apply
        </button>
      </div>
      {err ? <p className="text-[11px] text-red-600">{err}</p> : null}
    </div>
  );
}

function VariantAdminRow({
  variant,
  onChanged,
}: {
  variant: VariantInventoryRow;
  onChanged: () => void;
}) {
  return (
    <li className="rounded-lg border border-zinc-200/80 bg-white px-3 py-2 text-xs text-zinc-700">
      <p className="font-medium text-zinc-900">{variant.title}</p>
      <p className="text-zinc-500">
        SKU {variant.sku} · sale {variant.price} {variant.currency}
        {variant.compareAtPrice > variant.price ? ` · compare-at ${variant.compareAtPrice}` : ""} · on-hand{" "}
        {variant.onHand} · reserved {variant.reserved} · available {variant.available}
      </p>
      <VariantIdentityControls variant={variant} onChanged={onChanged} />
      <VariantPricingControls variant={variant} onChanged={onChanged} />
      <VariantStockControls variant={variant} onChanged={onChanged} />
    </li>
  );
}

export default function AdminProductClient({
  products,
  categories,
}: {
  products: ProductRow[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const catalogPag = useAdminTablePagination(products, [products.length]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const editingRef = useRef<ProductRow | null>(null);
  editingRef.current = editing;

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [productType, setProductType] = useState<string>("robot");
  const [ageRange, setAgeRange] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [packagingPrice, setPackagingPrice] = useState("");
  const [shippingPrice, setShippingPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [removeCover, setRemoveCover] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryIds, setGalleryIds] = useState<number[]>([]);
  const [createVariantTitle, setCreateVariantTitle] = useState("");
  const [createVariantSku, setCreateVariantSku] = useState("");
  const [createVariantPrice, setCreateVariantPrice] = useState("");
  const [createVariantCompareAt, setCreateVariantCompareAt] = useState("");
  const [createVariantCurrency, setCreateVariantCurrency] = useState<"USD" | "IRR">("USD");
  const [createVariantOnHand, setCreateVariantOnHand] = useState("0");
  const [tutorialBlocks, setTutorialBlocks] = useState<ClientTutorialBlock[]>([]);
  const [tutorialBusy, setTutorialBusy] = useState(false);
  const [tutorialError, setTutorialError] = useState("");

  const editingProduct = useMemo(() => {
    if (!editing) return null;
    return products.find((p) => p.id === editing.id) ?? editing;
  }, [editing, products]);

  const refreshCatalog = () => router.refresh();

  async function executeProductDelete(p: ProductRow) {
    setDeletingId(p.id);
    setCatalogError("");
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Delete failed");
      }
      if (editingRef.current?.id === p.id) {
        resetForm();
        setDrawerOpen(false);
      }
      router.refresh();
    } catch (err) {
      setCatalogError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  const productDelete = useDeleteWithUndo<ProductRow>({
    onExecuteDelete: executeProductDelete,
  });

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  function resetForm() {
    setTitle("");
    setShortDescription("");
    setDescription("");
    setSlug("");
    setProductType("robot");
    setAgeRange("");
    setCategoryId("");
    setPackagingPrice("");
    setShippingPrice("");
    setIsActive(true);
    setCoverFile(null);
    setGalleryFiles([]);
    setRemoveCover(false);
    setGalleryIds([]);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setEditing(null);
    setError("");
    setCatalogError("");
    setCreateVariantTitle("");
    setCreateVariantSku("");
    setCreateVariantPrice("");
    setCreateVariantCompareAt("");
    setCreateVariantCurrency("USD");
    setCreateVariantOnHand("0");
    setTutorialBlocks([]);
    setTutorialError("");
  }

  function openCreate() {
    resetForm();
    setDrawerOpen(true);
  }

  function handleDrawerOpenChange(next: boolean) {
    setDrawerOpen(next);
    if (!next) resetForm();
  }

  function productRowFromStrapiCreateResponse(
    json: unknown,
    opts: {
      imageUrl: string | null;
      coverId: number | null;
      galleryIds: number[];
      packagingPrice: number;
      shippingPrice: number;
    }
  ): ProductRow | null {
    const root = json as {
      data?: {
        id?: number;
        attributes?: {
          slug?: string;
          title?: string;
          shortDescription?: string;
          productType?: string;
          ageRange?: string | null;
          category?: { data?: { id?: number } | null };
          isActive?: boolean;
          packagingPrice?: unknown;
          shippingPrice?: unknown;
        };
      };
    };
    const id = root?.data?.id;
    if (typeof id !== "number") return null;
    const a = root.data?.attributes;
    const catId = a?.category?.data?.id;
    return {
      id,
      title: a?.title ?? title,
      slug: typeof a?.slug === "string" ? a.slug : slug,
      shortDescription: a?.shortDescription ?? shortDescription,
      productType: a?.productType ?? productType,
      ageRange:
        a?.ageRange && PRODUCT_AGE_RANGE_KEYS.includes(a.ageRange as ProductAgeRangeKey)
          ? a.ageRange
          : ageRange && PRODUCT_AGE_RANGE_KEYS.includes(ageRange as ProductAgeRangeKey)
            ? ageRange
            : null,
      categoryId: typeof catId === "number" ? catId : categoryId ? Number(categoryId) : null,
      isActive: Boolean(a?.isActive ?? isActive),
      packagingPrice:
        a?.packagingPrice !== undefined && a?.packagingPrice !== null
          ? parseMoney(a.packagingPrice)
          : opts.packagingPrice,
      shippingPrice:
        a?.shippingPrice !== undefined && a?.shippingPrice !== null
          ? parseMoney(a.shippingPrice)
          : opts.shippingPrice,
      imageUrl: opts.imageUrl,
      coverId: opts.coverId,
      galleryIds: opts.galleryIds,
      variants: [],
      tutorialBlocks: [],
    };
  }

  function startEdit(p: ProductRow) {
    setEditing(p);
    setTitle(p.title);
    setShortDescription(p.shortDescription || "");
    setDescription("");
    setSlug(p.slug || "");
    setProductType(p.productType || "robot");
    setAgeRange(
      p.ageRange && PRODUCT_AGE_RANGE_KEYS.includes(p.ageRange as ProductAgeRangeKey)
        ? p.ageRange
        : ""
    );
    setCategoryId(p.categoryId ? String(p.categoryId) : "");
    setPackagingPrice(String(p.packagingPrice ?? 0));
    setShippingPrice(String(p.shippingPrice ?? 0));
    setIsActive(p.isActive);
    setCoverFile(null);
    setGalleryFiles([]);
    setRemoveCover(false);
    setGalleryIds(p.galleryIds ?? []);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
    setError("");
    setCatalogError("");
    setTutorialBlocks(
      Array.isArray(p.tutorialBlocks) && p.tutorialBlocks.length > 0
        ? p.tutorialBlocks.map((b) => ({ ...b, key: b.key || newBlockKey() }))
        : []
    );
    setTutorialError("");
    setDrawerOpen(true);
  }

  function onCoverChange(f: File | null) {
    setCoverFile(f);
    setRemoveCover(false);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      let cover: number | undefined;
      if (coverFile) {
        cover = await uploadImageFile(coverFile);
      }
      let gallery: number[] | undefined;
      if (galleryFiles.length > 0) {
        gallery = await Promise.all(galleryFiles.map((file) => uploadImageFile(file)));
      }

      const packRaw = packagingPrice.trim();
      const shipRaw = shippingPrice.trim();
      const packN = packRaw === "" ? 0 : Number(packRaw);
      const shipN = shipRaw === "" ? 0 : Number(shipRaw);
      if (Number.isNaN(packN) || packN < 0) {
        setError("Invalid packaging price");
        setBusy(false);
        return;
      }
      if (Number.isNaN(shipN) || shipN < 0) {
        setError("Invalid shipping price");
        setBusy(false);
        return;
      }

      const priceTrim = createVariantPrice.trim();
      let variantPayload: Record<string, unknown> | undefined;
      if (priceTrim !== "") {
        const p = Number(priceTrim);
        if (Number.isNaN(p) || p < 0) {
          setError("Invalid sale price for the default variant");
          setBusy(false);
          return;
        }
        const cRaw = createVariantCompareAt.trim();
        const c = cRaw === "" ? 0 : Number(cRaw);
        if (Number.isNaN(c) || c < 0) {
          setError("Invalid compare-at price");
          setBusy(false);
          return;
        }
        const onHand = Math.max(0, Math.floor(Number(createVariantOnHand) || 0));
        variantPayload = {
          price: p,
          compareAtPrice: c,
          currency: createVariantCurrency,
          onHand,
          ...(createVariantSku.trim() ? { sku: createVariantSku.trim() } : {}),
          ...(createVariantTitle.trim() ? { title: createVariantTitle.trim() } : {}),
        };
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          productType,
          isActive,
          ...(shortDescription ? { shortDescription } : {}),
          ...(description ? { description } : {}),
          ...(slug ? { slug } : {}),
          ...(categoryId ? { category: Number(categoryId) } : {}),
          ...(cover != null ? { cover } : {}),
          ...(gallery?.length ? { gallery } : {}),
          ...(ageRange ? { ageRange } : {}),
          packagingPrice: packN,
          shippingPrice: shipN,
          ...(variantPayload ? { variant: variantPayload } : {}),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Create failed");
      }

      const galleryFromResponse = (() => {
        const g = (json as { data?: { attributes?: { gallery?: { data?: { id?: number }[] } } } })
          ?.data?.attributes?.gallery?.data;
        if (!Array.isArray(g)) return [] as number[];
        return g.map((x) => x.id).filter((x): x is number => typeof x === "number");
      })();

      const coverFromResponse = (() => {
        const c = (json as { data?: { attributes?: { cover?: { data?: { id?: number } | null } } } })
          ?.data?.attributes?.cover?.data;
        if (c && typeof c === "object" && "id" in c && typeof c.id === "number") return c.id;
        return null as number | null;
      })();

      const row = productRowFromStrapiCreateResponse(json, {
        imageUrl: coverPreview || null,
        coverId: coverFromResponse,
        galleryIds: galleryFromResponse.length ? galleryFromResponse : galleryIds,
        packagingPrice: packN,
        shippingPrice: shipN,
      });
      if (!row) {
        throw new Error("Create succeeded but product id was missing from the response");
      }

      setEditing(row);
      setGalleryIds(row.galleryIds);
      setCreateVariantTitle("");
      setCreateVariantSku("");
      setCreateVariantPrice("");
      setCreateVariantCompareAt("");
      setCreateVariantCurrency("USD");
      setCreateVariantOnHand("0");
      setCoverFile(null);
      setGalleryFiles([]);
      setError("");
      if (tutorialBlocks.length > 0) {
        await saveTutorialForProduct(row.id, tutorialBlocks);
      }
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
      let cover: number | null | undefined;
      if (coverFile) {
        cover = await uploadImageFile(coverFile);
      } else if (removeCover) {
        cover = null;
      }
      let gallery: number[] | undefined;
      if (galleryFiles.length > 0) {
        const newIds = await Promise.all(galleryFiles.map((file) => uploadImageFile(file)));
        gallery = [...galleryIds, ...newIds];
      }
      const res = await fetch(`/api/admin/products/${editing.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          productType,
          isActive,
          shortDescription: shortDescription || undefined,
          ...(description ? { description } : {}),
          ...(slug ? { slug } : {}),
          category: categoryId ? Number(categoryId) : null,
          ageRange: ageRange || null,
          ...(cover !== undefined ? { cover } : {}),
          ...(gallery !== undefined ? { gallery } : {}),
        }),
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

  function addTutorialBlock(kind: ClientTutorialBlock["kind"]) {
    const key = newBlockKey();
    if (kind === "richtext") {
      setTutorialBlocks((prev) => [...prev, { key, kind: "richtext", body: "" }]);
    } else if (kind === "image") {
      setTutorialBlocks((prev) => [...prev, { key, kind: "image", mediaId: null }]);
    } else if (kind === "video") {
      setTutorialBlocks((prev) => [...prev, { key, kind: "video", mediaId: null }]);
    } else {
      setTutorialBlocks((prev) => [...prev, { key, kind: "embed", url: "" }]);
    }
  }

  function moveTutorialBlock(key: string, delta: number) {
    setTutorialBlocks((prev) => {
      const i = prev.findIndex((b) => b.key === key);
      if (i < 0) return prev;
      const j = i + delta;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function removeTutorialBlock(key: string) {
    setTutorialBlocks((prev) => prev.filter((b) => b.key !== key));
  }

  function updateTutorialBlock(key: string, patch: Partial<ClientTutorialBlock>) {
    setTutorialBlocks((prev) =>
      prev.map((b) => (b.key === key ? ({ ...b, ...patch } as ClientTutorialBlock) : b))
    );
  }

  async function saveTutorialForProduct(productId: number, blocks: ClientTutorialBlock[]) {
    setTutorialBusy(true);
    setTutorialError("");
    try {
      const res = await fetch(`/api/admin/product-tutorials/by-product/${productId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Failed to save tutorial");
      }
      if (Array.isArray(json.blocks)) {
        setTutorialBlocks(json.blocks);
      }
      router.refresh();
    } catch (err) {
      setTutorialError(err instanceof Error ? err.message : "Tutorial save failed");
      throw err;
    } finally {
      setTutorialBusy(false);
    }
  }

  async function saveTutorial() {
    if (!editing) {
      setTutorialError("First create the product, then save the tutorial.");
      return;
    }
    await saveTutorialForProduct(editing.id, tutorialBlocks);
  }

  async function onTutorialMediaChange(key: string, file: File | null, _kind: "image" | "video") {
    if (!file) return;
    try {
      const id = await uploadAdminMediaFile(file);
      const previewUrl = URL.createObjectURL(file);
      updateTutorialBlock(key, { mediaId: id, previewUrl });
    } catch (e) {
      setTutorialError(e instanceof Error ? e.message : "Upload failed");
    }
  }

  const productTypeLabel = (value: string) =>
    PRODUCT_TYPES.find((t) => t.value === value)?.label ?? value;

  return (
    <div className="space-y-6">
      <AdminRightDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        size="wide"
        title={editing ? `Edit product #${editing.id}` : "New product"}
        description={
          editing
            ? "Cover, gallery, and core fields. Variants & inventory below for SKU, prices, and stock."
            : "Uploads go to Strapi. Optional default variant (sale price) so the storefront shows price and stock."
        }
      >
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={editing ? submitEdit : submitCreate}>
          <label className="sm:col-span-2 block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Title</span>
            <input
              className={input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Short description</span>
            <input
              className={input}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              maxLength={320}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Type</span>
            <select
              className={input}
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
            >
              {PRODUCT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Age range (optional)</span>
            <select
              className={input}
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
            >
              <option value="">— None —</option>
              {AGE_RANGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2 block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Description (richtext)</span>
            <textarea
              className={cn(input, "min-h-[72px] resize-y")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={editing ? "Leave empty to keep existing body" : "Optional"}
            />
          </label>
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
          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Packaging price</span>
            <input
              className={input}
              type="number"
              min={0}
              step="0.01"
              value={packagingPrice}
              onChange={(e) => setPackagingPrice(e.target.value)}
              placeholder="0"
            />
            <span className="block text-[11px] text-zinc-500">
              One-time packaging fee for this product (same currency as variants).
            </span>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Shipping price</span>
            <input
              className={input}
              type="number"
              min={0}
              step="0.01"
              value={shippingPrice}
              onChange={(e) => setShippingPrice(e.target.value)}
              placeholder="0"
            />
            <span className="block text-[11px] text-zinc-500">
              Shipping charge for this product (same currency as variants).
            </span>
          </label>
          <div className="sm:col-span-2 space-y-1">
            <span className="block text-xs font-medium text-zinc-600">Cover image</span>
            <input
              type="file"
              accept="image/*"
              className={cn(input, "py-1.5 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-1 file:text-xs file:font-medium")}
              onChange={(e) => onCoverChange(e.target.files?.[0] ?? null)}
            />
            {editing && (editing.coverId != null || editing.imageUrl) ? (
              <label className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
                <input
                  type="checkbox"
                  checked={removeCover}
                  onChange={(e) => {
                    setRemoveCover(e.target.checked);
                    if (e.target.checked) {
                      setCoverFile(null);
                      if (coverPreview) URL.revokeObjectURL(coverPreview);
                      setCoverPreview(null);
                    }
                  }}
                  className="rounded border-zinc-300"
                />
                Remove current cover (save to apply)
              </label>
            ) : null}
            {coverPreview || (editing && editing.imageUrl && !removeCover && !coverFile) ? (
              <div className="relative mt-2 h-28 w-40 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                <Image
                  src={(coverPreview || editing?.imageUrl) as string}
                  alt="Cover preview"
                  fill
                  className="object-cover"
                  sizes="160px"
                  unoptimized={(() => {
                    const u = coverPreview || editing?.imageUrl || "";
                    return u.includes("localhost") || u.includes("127.0.0.1");
                  })()}
                />
              </div>
            ) : null}
          </div>
          <label className="sm:col-span-2 block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Gallery (optional)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className={cn(input, "py-1.5 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-1 file:text-xs file:font-medium")}
              onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
            />
            <p className="text-[11px] text-zinc-500">
              {editing
                ? "New files are appended to the existing gallery after save."
                : "You can select multiple images at once."}
            </p>
          </label>
          {!editing ? (
            <div className="sm:col-span-2 space-y-3 rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-4">
              <p className="text-xs font-bold text-zinc-900">Default variant (pricing &amp; stock)</p>
              <p className="text-[11px] text-zinc-600">
                Enter a <strong className="font-medium">sale price</strong> to create one variant with
                inventory. Compare-at is optional (higher value shows a discount on the shop). Leave
                sale price empty if you will add variants only in Strapi.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-zinc-600">Variant title (optional)</span>
                  <input
                    className={input}
                    value={createVariantTitle}
                    onChange={(e) => setCreateVariantTitle(e.target.value)}
                    placeholder="Same as product title if empty"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-zinc-600">SKU (optional)</span>
                  <input
                    className={input}
                    value={createVariantSku}
                    onChange={(e) => setCreateVariantSku(e.target.value)}
                    placeholder="Auto from slug if empty"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-zinc-600">Sale price</span>
                  <input
                    className={input}
                    type="number"
                    min={0}
                    step="0.01"
                    value={createVariantPrice}
                    onChange={(e) => setCreateVariantPrice(e.target.value)}
                    placeholder="e.g. 49.99"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-zinc-600">Compare-at (optional)</span>
                  <input
                    className={input}
                    type="number"
                    min={0}
                    step="0.01"
                    value={createVariantCompareAt}
                    onChange={(e) => setCreateVariantCompareAt(e.target.value)}
                    placeholder="Higher = strikethrough + % off"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-zinc-600">Currency</span>
                  <select
                    className={input}
                    value={createVariantCurrency}
                    onChange={(e) =>
                      setCreateVariantCurrency(e.target.value === "IRR" ? "IRR" : "USD")
                    }
                  >
                    <option value="USD">USD</option>
                    <option value="IRR">IRR</option>
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-zinc-600">On hand (stock)</span>
                  <input
                    className={input}
                    type="number"
                    min={0}
                    step={1}
                    value={createVariantOnHand}
                    onChange={(e) => setCreateVariantOnHand(e.target.value)}
                  />
                </label>
              </div>
            </div>
          ) : null}
          {editing && editingProduct ? (
            <div className="sm:col-span-2 space-y-3 rounded-xl border border-emerald-200/60 bg-emerald-50/35 p-4">
              <div>
                <p className="text-xs font-bold text-zinc-900">Variants &amp; inventory</p>
                <p className="mt-0.5 text-[11px] text-zinc-600">
                  Edit variant title, SKU, currency, sale/compare-at prices, and stock for this
                  product. Changes apply immediately in Strapi (separate from &quot;Save product&quot;).
                </p>
              </div>
              {editingProduct.variants.length === 0 ? (
                <p className="text-[11px] text-zinc-500">
                  No variants yet — create one in Strapi or recreate the product with a default
                  variant.
                </p>
              ) : (
                <ul className="space-y-3">
                  {editingProduct.variants.map((v) => (
                    <VariantAdminRow key={v.variantId} variant={v} onChanged={refreshCatalog} />
                  ))}
                </ul>
              )}
            </div>
          ) : null}
          <div className="sm:col-span-2 space-y-3 rounded-xl border border-violet-200/70 bg-violet-50/40 p-4">
              <div>
                <p className="text-xs font-bold text-zinc-900">Product tutorial</p>
                <p className="mt-0.5 text-[11px] text-zinc-600">
                  Shown to customers only after a qualifying purchase. Save blocks separately from
                  the product form.
                  {!editing
                    ? " You can add blocks now—after you create the product, tutorial content will be saved automatically."
                    : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => addTutorialBlock("richtext")}
                  className="rounded-lg border border-violet-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-900 hover:bg-violet-50"
                >
                  + Text
                </button>
                <button
                  type="button"
                  onClick={() => addTutorialBlock("image")}
                  className="rounded-lg border border-violet-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-900 hover:bg-violet-50"
                >
                  + Image
                </button>
                <button
                  type="button"
                  onClick={() => addTutorialBlock("video")}
                  className="rounded-lg border border-violet-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-900 hover:bg-violet-50"
                >
                  + Video file
                </button>
                <button
                  type="button"
                  onClick={() => addTutorialBlock("embed")}
                  className="rounded-lg border border-violet-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-violet-900 hover:bg-violet-50"
                >
                  + Video URL
                </button>
              </div>
              <ul className="space-y-3">
                {tutorialBlocks.length === 0 ? (
                  <li className="text-[11px] text-zinc-500">No tutorial blocks yet.</li>
                ) : null}
                {tutorialBlocks.map((b, idx) => (
                  <li
                    key={b.key}
                    className="rounded-lg border border-violet-100 bg-white/90 p-3 text-xs text-zinc-800"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold capitalize text-zinc-700">
                        {b.kind === "embed"
                          ? "Video URL"
                          : b.kind === "richtext"
                            ? "Text"
                            : b.kind === "image"
                              ? "Image"
                              : "Video file"}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveTutorialBlock(b.key, -1)}
                          className="rounded border border-zinc-200 px-2 py-0.5 text-[10px] font-medium disabled:opacity-40"
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          disabled={idx === tutorialBlocks.length - 1}
                          onClick={() => moveTutorialBlock(b.key, 1)}
                          className="rounded border border-zinc-200 px-2 py-0.5 text-[10px] font-medium disabled:opacity-40"
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          onClick={() => removeTutorialBlock(b.key)}
                          className="rounded border border-red-200 px-2 py-0.5 text-[10px] font-medium text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {b.kind === "richtext" ? (
                      <textarea
                        className={cn(input, "min-h-[100px] w-full resize-y")}
                        value={b.body}
                        onChange={(e) => updateTutorialBlock(b.key, { body: e.target.value })}
                        placeholder="Rich text HTML from Strapi (e.g. paragraphs, lists)"
                      />
                    ) : null}
                    {b.kind === "embed" ? (
                      <input
                        className={input}
                        type="url"
                        value={b.url}
                        onChange={(e) => updateTutorialBlock(b.key, { url: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=…"
                      />
                    ) : null}
                    {b.kind === "image" ? (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          className={cn(input, "py-1.5 file:mr-2 file:rounded file:border-0 file:bg-zinc-100 file:px-2 file:py-1 file:text-[10px]")}
                          onChange={(e) =>
                            onTutorialMediaChange(b.key, e.target.files?.[0] ?? null, "image")
                          }
                        />
                        {b.mediaId != null ? (
                          <p className="text-[10px] text-zinc-500">Media id: {b.mediaId}</p>
                        ) : null}
                        {b.previewUrl ? (
                          <div className="relative mt-1 h-24 w-full max-w-xs overflow-hidden rounded-lg border border-zinc-200">
                            <Image
                              src={b.previewUrl}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized={
                                b.previewUrl.startsWith("blob:") ||
                                b.previewUrl.includes("localhost")
                              }
                            />
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {b.kind === "video" ? (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="video/*"
                          className={cn(input, "py-1.5 file:mr-2 file:rounded file:border-0 file:bg-zinc-100 file:px-2 file:py-1 file:text-[10px]")}
                          onChange={(e) =>
                            onTutorialMediaChange(b.key, e.target.files?.[0] ?? null, "video")
                          }
                        />
                        {b.mediaId != null ? (
                          <p className="text-[10px] text-zinc-500">Media id: {b.mediaId}</p>
                        ) : null}
                        {b.previewUrl && !b.previewUrl.startsWith("blob:") ? (
                          <video
                            src={b.previewUrl}
                            className="mt-1 max-h-40 max-w-full rounded-lg border border-zinc-200"
                            controls
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
              {tutorialError ? <p className="text-xs text-red-600">{tutorialError}</p> : null}
              {editing ? (
                <button
                  type="button"
                  disabled={tutorialBusy}
                  onClick={saveTutorial}
                  className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50"
                >
                  {tutorialBusy ? "Saving tutorial…" : "Save tutorial"}
                </button>
              ) : null}
            </div>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-zinc-300"
            />
            <span className="text-sm text-zinc-700">Active in catalog</span>
          </label>
          {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {busy ? "Saving…" : editing ? "Save product" : "Create product"}
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
          <Package className="h-4 w-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">Catalog</h2>
          <span className="text-xs text-zinc-500">{catalogPag.totalCount} total</span>
          <button
            type="button"
            onClick={openCreate}
            disabled={
              deletingId != null || productDelete.toastOpen || productDelete.dialogOpen || drawerOpen
            }
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            New product
          </button>
        </div>
        {catalogError ? <p className="px-4 py-2 text-sm text-red-600">{catalogError}</p> : null}
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse bg-white text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3 w-16">Image</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Variants</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    No products yet. Use <span className="font-medium text-zinc-700">New product</span>{" "}
                    or assign categories under <span className="font-medium text-zinc-700">Categories</span>.
                  </td>
                </tr>
              ) : (
                catalogPag.pageItems.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-zinc-50 transition-colors hover:bg-zinc-50/60"
                  >
                    <td className="px-4 py-3">
                      <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-100">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="44px"
                            unoptimized={
                              p.imageUrl.includes("localhost") || p.imageUrl.includes("127.0.0.1")
                            }
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-zinc-400">
                            <Package className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="max-w-[200px] px-4 py-3">
                      <p className="truncate font-medium text-zinc-900">{p.title}</p>
                      {p.ageRange && PRODUCT_AGE_RANGE_KEYS.includes(p.ageRange as ProductAgeRangeKey) ? (
                        <p className="truncate text-[11px] text-zinc-500">
                          {PRODUCT_AGE_RANGE_LABELS[p.ageRange as ProductAgeRangeKey]}
                        </p>
                      ) : null}
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-zinc-600">{p.slug || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-700">
                      {productTypeLabel(p.productType)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                          p.isActive ? "bg-emerald-50 text-emerald-800" : "bg-zinc-200 text-zinc-600"
                        )}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-zinc-800">
                      {p.variants.length}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          disabled={
                            deletingId != null ||
                            productDelete.toastOpen ||
                            productDelete.dialogOpen
                          }
                          className="inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-lg border border-zinc-200 bg-white px-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => productDelete.openConfirm(p)}
                          disabled={
                            deletingId != null ||
                            productDelete.toastOpen ||
                            productDelete.dialogOpen
                          }
                          className="inline-flex h-9 min-w-[4.5rem] items-center justify-center rounded-lg border border-red-200 bg-white px-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === p.id ? "…" : "Delete"}
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
          totalCount={catalogPag.totalCount}
          page={catalogPag.page}
          totalPages={catalogPag.totalPages}
          pageSize={catalogPag.pageSize}
          rangeFrom={catalogPag.rangeFrom}
          rangeTo={catalogPag.rangeTo}
          onPageChange={catalogPag.setPage}
          onPageSizeChange={catalogPag.setPageSize}
        />
      </div>
      <DeleteConfirmDialog
        open={productDelete.dialogOpen}
        onOpenChange={productDelete.onDialogOpenChange}
        title={
          productDelete.pendingItem
            ? `Delete “${productDelete.pendingItem.title}”?`
            : "Delete product?"
        }
        description="The product and all its variants and inventory will be removed from Strapi. After you confirm, you can still undo until the countdown finishes."
        onConfirm={productDelete.confirmDelete}
      />
      <PendingDeleteUndoToast
        open={productDelete.toastOpen}
        message={
          productDelete.pendingItem
            ? `“${productDelete.pendingItem.title}” will be permanently deleted.`
            : "The item will be permanently deleted."
        }
        secondsLeft={productDelete.secondsLeft}
        onUndo={productDelete.undo}
      />
    </div>
  );
}
