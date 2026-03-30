import Image from "next/image";
import Link from "next/link";
import { cn } from "lib/utils";
import {
  fetchStrapiCollectionWithError,
  strapiServerBaseUrl,
} from "lib/strapi-server-fetch";
import { productListImageUrl } from "lib/strapi-media";
import {
  PRODUCT_AGE_RANGE_KEYS,
  PRODUCT_AGE_RANGE_LABELS,
  productAgeRangeLabel,
} from "lib/product-age-range";
import {
  PRODUCT_TYPE_KEYS,
  PRODUCT_TYPE_LABELS,
  isProductTypeKey,
  productTypeLabel,
} from "lib/product-type";
import { productStockUi, stockBadgeClass, stockBadgeLabel } from "lib/shop-inventory";
import { firstVariantPricingFromProduct, variantDiscountPercent } from "lib/variant-pricing";
import StorefrontPriceRow from "components/shop/storefront-price-row";
import ShopEmptyState from "components/shop/shop-empty-state";
import {
  attachVariantsFromMap,
  fetchVariantsGroupedByProductId,
} from "lib/hydrate-product-variants";

async function getProducts(search: string, productType: string, ageRange: string) {
  const base = strapiServerBaseUrl().replace(/\/$/, "");
  if (!base) {
    return { rows: [] as unknown[], fetchError: "Content API URL is not configured (STRAPI_API_URL)." };
  }
  const params = new URLSearchParams();
  /** Match admin catalog locale so variants (and their inventory) resolve for localized products. */
  params.set("locale", "en");
  params.set("populate[cover]", "true");
  params.set("populate[gallery]", "true");
  /**
   * Do not also set `populate[variants]=true`: qs merges that with nested keys into an array and
   * Strapi throws "Invalid nested populate".
   */
  params.set("populate[variants][populate]", "inventory");
  if (search) params.set("filters[title][$containsi]", search);
  if (productType && isProductTypeKey(productType)) {
    params.set("filters[productType][$eq]", productType);
  }
  if (ageRange && (PRODUCT_AGE_RANGE_KEYS as readonly string[]).includes(ageRange)) {
    params.set("filters[ageRange][$eq]", ageRange);
  }
  params.set("pagination[pageSize]", "24");

  const { data: rows, error: listError } = await fetchStrapiCollectionWithError(
    `${base}/api/products?${params.toString()}`
  );
  if (listError) {
    return { rows: [] as unknown[], fetchError: listError };
  }
  const byPid = await fetchVariantsGroupedByProductId(base);
  attachVariantsFromMap(rows, byPid);
  return { rows, fetchError: null as string | null };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { q?: string; productType?: string; ageRange?: string };
}) {
  const q = searchParams?.q || "";
  const productType = searchParams?.productType || "";
  const ageRange = searchParams?.ageRange || "";
  const { rows: products, fetchError } = await getProducts(q, productType, ageRange);
  const hasActiveFilters = Boolean(
    (q && q.trim()) || (productType && productType.trim()) || (ageRange && ageRange.trim())
  );

  return (
    <main className="max-w-screen-xl mx-auto px-5 py-12 space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">BrainWave Store</h1>
        <p className="text-sm text-gray-600">
          Explore robots, robot parts, and 3D printed products with fast filtering.
        </p>
      </section>

      {fetchError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
        >
          <p className="font-semibold">Store catalog unavailable</p>
          <p className="mt-1 text-red-900/90">{fetchError}</p>
        </div>
      ) : null}

      <form
        method="get"
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3",
          "bg-[#FEF8EC] rounded-2xl p-4 border border-[#FEA439]/20"
        )}
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products..."
          className={cn(
            "h-10 px-4 rounded-full w-full",
            "bg-white border border-black/10",
            "focus:outline-none focus:ring-2 focus:ring-[#19C1B6]/40"
          )}
        />
        <select
          name="productType"
          defaultValue={productType}
          className={cn(
            "h-10 px-4 rounded-full w-full",
            "bg-white border border-black/10",
            "focus:outline-none focus:ring-2 focus:ring-[#19C1B6]/40"
          )}
        >
          <option value="">All product types</option>
          {PRODUCT_TYPE_KEYS.map((key) => (
            <option key={key} value={key}>
              {PRODUCT_TYPE_LABELS[key]}
            </option>
          ))}
        </select>
        <select
          name="ageRange"
          defaultValue={ageRange}
          className={cn(
            "h-10 px-4 rounded-full w-full",
            "bg-white border border-black/10",
            "focus:outline-none focus:ring-2 focus:ring-[#19C1B6]/40"
          )}
        >
          <option value="">All ages</option>
          {PRODUCT_AGE_RANGE_KEYS.map((key) => (
            <option key={key} value={key}>
              {PRODUCT_AGE_RANGE_LABELS[key]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className={cn(
            "w-full h-10 bg-[#FEA439] text-white rounded-full text-base font-medium shadow-none px-4",
            "inline-flex items-center justify-center gap-2 sm:col-span-2 lg:col-span-1"
          )}
        >
          Apply Filters
        </button>
      </form>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.length === 0 ? (
          <div className="col-span-full flex justify-center py-6 sm:py-10">
            <ShopEmptyState hasActiveFilters={hasActiveFilters} />
          </div>
        ) : null}
        {products.map((product: any) => {
          const attrs = product.attributes;
          const imgUrl = productListImageUrl(attrs);
          const typeKey = attrs?.productType as string | undefined;
          const typeLabel = productTypeLabel(typeKey);
          const fp = firstVariantPricingFromProduct(product);
          const discPct =
            fp != null ? variantDiscountPercent(fp.price, fp.compareAtPrice) : null;
          const slug = attrs?.slug as string | undefined;
          const ageKey = attrs?.ageRange as string | undefined;
          const ageLabel = productAgeRangeLabel(ageKey);
          const stock = productStockUi(attrs);
          const unopt = Boolean(
            imgUrl && (imgUrl.includes("localhost") || imgUrl.includes("127.0.0.1"))
          );
          return (
            <article
              key={product.id}
              className={cn(
                "rounded-2xl overflow-hidden space-y-0 flex flex-col",
                "bg-white border border-black/10 hover:border-iconColor/40 transition-colors"
              )}
            >
              <Link href={slug ? `/shop/${slug}` : "#"} className="block relative aspect-[4/3] bg-gray-100">
                {discPct != null ? (
                  <span className="absolute right-2 top-2 z-10 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white shadow">
                    {discPct}% off
                  </span>
                ) : null}
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={attrs?.title || "Product"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    unoptimized={unopt}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                    No image
                  </span>
                )}
              </Link>
              <div className="p-4 space-y-2 flex flex-col flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {typeLabel && typeKey ? (
                    <Link
                      href={`/shop?productType=${encodeURIComponent(typeKey)}${ageKey ? `&ageRange=${encodeURIComponent(ageKey)}` : ""}`}
                      className="text-[11px] font-semibold uppercase tracking-wide text-[#19C1B6] hover:underline w-fit"
                    >
                      {typeLabel}
                    </Link>
                  ) : null}
                  {ageLabel && ageKey ? (
                    <Link
                      href={`/shop?ageRange=${encodeURIComponent(ageKey)}`}
                      className="text-[11px] font-medium text-gray-600 hover:text-[#19C1B6] hover:underline w-fit"
                    >
                      {ageLabel}
                    </Link>
                  ) : null}
                </div>
                <h2 className="font-semibold line-clamp-2">
                  <Link href={slug ? `/shop/${slug}` : "#"} className="hover:text-[#19C1B6] transition-colors">
                    {attrs?.title || "Untitled product"}
                  </Link>
                </h2>
                <span
                  className={cn(
                    "inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                    stockBadgeClass(stock)
                  )}
                >
                  {stockBadgeLabel(stock)}
                </span>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {attrs?.shortDescription || "No description"}
                </p>
                {fp != null ? (
                  <StorefrontPriceRow
                    price={fp.price}
                    compareAtPrice={fp.compareAtPrice}
                    currency={fp.currency}
                    size="sm"
                  />
                ) : null}
                <Link
                  href={slug ? `/shop/${slug}` : "#"}
                  className="inline-flex text-sm font-semibold text-[#19C1B6] hover:underline mt-auto pt-1"
                >
                  View product
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
