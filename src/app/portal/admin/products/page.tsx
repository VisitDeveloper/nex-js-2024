import AdminProductClient, {
  type CategoryOption,
  type ProductRow,
  type VariantInventoryRow,
} from "components/specific_elements/portal/admin-product-client";
import { adminStrapiAuthHeaders } from "lib/admin-strapi";
import { fetchStrapiCollectionWithError } from "lib/strapi-server-fetch";
import { productListImageUrl } from "lib/strapi-media";
import { parseMoney } from "lib/variant-pricing";
import { getStrapiOrigin } from "lib/strapi-origin";
import {
  attachVariantsFromMap,
  fetchVariantsGroupedByProductId,
} from "lib/hydrate-product-variants";
import { blocksFromStrapiAttributes, type ClientTutorialBlock } from "lib/tutorial-blocks";

async function getProducts() {
  const base = (getStrapiOrigin() || process.env.NEXT_PUBLIC_BASE_API_URL_SERVER || "").replace(/\/$/, "");
  const headers = await adminStrapiAuthHeaders();
  if (!base) {
    return { rows: [] as any[], error: "Content API URL is not configured." };
  }
  const { data: rows, error } = await fetchStrapiCollectionWithError(
    `${base}/api/products?pagination[pageSize]=100&populate[variants][populate]=inventory&populate[category]=true&populate[cover]=true&populate[gallery]=true&locale=en`,
    { headers }
  );
  if (error) return { rows: [] as any[], error };
  const byPid = await fetchVariantsGroupedByProductId(base, { headers });
  attachVariantsFromMap(rows, byPid);
  return { rows, error: null as string | null };
}

async function getCategories() {
  const base = (getStrapiOrigin() || process.env.NEXT_PUBLIC_BASE_API_URL_SERVER || "").replace(/\/$/, "");
  const headers = await adminStrapiAuthHeaders();
  return fetchStrapiCollectionWithError(
    `${base}/api/categories?pagination[pageSize]=200&sort=name:asc`,
    { headers }
  );
}

async function getTutorialsByProductId(): Promise<{
  map: Map<number, ClientTutorialBlock[]>;
  error: string | null;
}> {
  const base = (getStrapiOrigin() || process.env.NEXT_PUBLIC_BASE_API_URL_SERVER || "").replace(/\/$/, "");
  const headers = await adminStrapiAuthHeaders();
  const { data: rows, error } = await fetchStrapiCollectionWithError(
    `${base}/api/product-tutorials?locale=en&pagination[pageSize]=200&populate[product]=true&populate[blocks][populate]=*`,
    { headers }
  );
  if (error) return { map: new Map(), error };
  const map = new Map<number, ClientTutorialBlock[]>();
  for (const row of rows) {
    const pid = row.attributes?.product?.data?.id;
    if (typeof pid !== "number") continue;
    const blocks = blocksFromStrapiAttributes(row.attributes?.blocks, base);
    map.set(pid, blocks);
  }
  return { map, error: null };
}

function mapVariantInventoryRows(variantsData: unknown): VariantInventoryRow[] {
  if (!Array.isArray(variantsData)) return [];
  return variantsData.map((v: any) => {
    const inv = v.attributes?.inventory?.data;
    const ia = inv?.attributes;
    return {
      variantId: v.id,
      title: v.attributes?.title ?? "",
      sku: v.attributes?.sku ?? "",
      price: parseMoney(v.attributes?.price),
      compareAtPrice: parseMoney(v.attributes?.compareAtPrice),
      currency: (v.attributes?.currency as string) || "USD",
      inventoryId: inv?.id ?? null,
      onHand: Number(ia?.onHand) || 0,
      reserved: Number(ia?.reserved) || 0,
      available: Number(ia?.available) || 0,
    };
  });
}

function mapProducts(
  raw: any[],
  tutorialByProductId: Map<number, ClientTutorialBlock[]>
): ProductRow[] {
  return raw.map((p) => {
    const galleryData = p.attributes?.gallery?.data;
    const galleryIds = Array.isArray(galleryData)
      ? galleryData.map((g: { id?: number }) => g.id).filter((id: unknown): id is number => typeof id === "number")
      : [];
    const coverData = p.attributes?.cover?.data;
    const coverId =
      coverData && !Array.isArray(coverData) && typeof coverData.id === "number"
        ? coverData.id
        : null;
    return {
      id: p.id,
      title: p.attributes?.title ?? "",
      slug: p.attributes?.slug ?? "",
      shortDescription: p.attributes?.shortDescription ?? "",
      productType: p.attributes?.productType ?? "robot",
      ageRange: (p.attributes?.ageRange as string | null | undefined) ?? null,
      categoryId: p.attributes?.category?.data?.id ?? null,
      isActive: Boolean(p.attributes?.isActive ?? true),
      packagingPrice: parseMoney(p.attributes?.packagingPrice),
      shippingPrice: parseMoney(p.attributes?.shippingPrice),
      imageUrl: productListImageUrl(p.attributes),
      coverId,
      galleryIds,
      variants: mapVariantInventoryRows(p.attributes?.variants?.data),
      tutorialBlocks: tutorialByProductId.get(p.id) ?? [],
    };
  });
}

function mapCategoryOptions(raw: any[]): CategoryOption[] {
  return raw.map((c) => ({
    id: c.id,
    name: c.attributes?.name ?? `Category ${c.id}`,
  }));
}

export default async function AdminProductsPage() {
  const [productResult, categoryResult, tutorialResult] = await Promise.all([
    getProducts(),
    getCategories(),
    getTutorialsByProductId(),
  ]);
  const productData = productResult.rows;
  const categoryData = categoryResult.data;
  const tutorialByProductId = tutorialResult.map;
  const fetchError =
    [productResult.error, categoryResult.error, tutorialResult.error].filter(Boolean).join(" · ") ||
    null;
  const products = mapProducts(productData, tutorialByProductId);
  const categories = mapCategoryOptions(categoryData);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Products &amp; inventory</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Set <strong className="font-medium">sale price</strong> and optional{" "}
          <strong className="font-medium">compare-at</strong> per variant for storefront discounts. Stock
          uses the same variant rows below.
        </p>
      </header>
      {fetchError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
        >
          <p className="font-semibold">Could not load catalog data from Strapi</p>
          <p className="mt-1 text-red-900/90">{fetchError}</p>
        </div>
      ) : null}
      <AdminProductClient products={products} categories={categories} />
    </div>
  );
}
