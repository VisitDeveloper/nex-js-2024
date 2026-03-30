import Image from "next/image";
import Link from "next/link";
import { fetchStrapiFirstWithError, strapiServerBaseUrl } from "lib/strapi-server-fetch";
import { productGalleryImageUrls } from "lib/strapi-media";
import { productAgeRangeLabel } from "lib/product-age-range";
import { productTypeLabel } from "lib/product-type";
import {
  inventoryAttributesFromVariant,
  productStockUi,
  stockBadgeClass,
  stockBadgeLabel,
} from "lib/shop-inventory";
import { parseMoney } from "lib/variant-pricing";
import StorefrontPriceRow from "components/shop/storefront-price-row";
import { fetchVariantsForProductId } from "lib/hydrate-product-variants";

async function getProduct(slug: string) {
  const base = strapiServerBaseUrl().replace(/\/$/, "");
  if (!base) {
    return { product: null, fetchError: "Content API URL is not configured (STRAPI_API_URL)." };
  }
  const params = new URLSearchParams();
  params.set("locale", "en");
  params.set("filters[slug][$eq]", slug);
  params.set("populate[variants][populate]", "inventory");
  params.set("populate[cover]", "true");
  params.set("populate[gallery]", "true");
  const { item: product, error: fetchError } = await fetchStrapiFirstWithError(
    `${base}/api/products?${params.toString()}`
  );
  if (fetchError) {
    return { product: null, fetchError };
  }
  if (
    product &&
    typeof product.id === "number" &&
    (!Array.isArray(product.attributes?.variants?.data) ||
      product.attributes.variants.data.length === 0)
  ) {
    const extra = await fetchVariantsForProductId(base, product.id);
    if (extra.length) {
      product.attributes = product.attributes ?? {};
      (product.attributes as { variants?: { data: unknown[] } }).variants = { data: extra };
    }
  }
  return { product, fetchError: null as string | null };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const { product, fetchError } = await getProduct(params.slug);

  if (fetchError) {
    return (
      <main className="max-w-screen-xl mx-auto px-5 py-12 space-y-4">
        <Link href="/shop" className="underline text-sm">
          Back to store
        </Link>
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950"
        >
          <p className="font-semibold">Product unavailable</p>
          <p className="mt-1 text-red-900/90">{fetchError}</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-screen-xl mx-auto px-5 py-12">
        <p>Product not found.</p>
      </main>
    );
  }

  const variants = product.attributes?.variants?.data || [];
  const firstVariant = variants[0];
  const firstAttrs = firstVariant?.attributes as Record<string, unknown> | undefined;
  const firstPricing = firstAttrs
    ? {
        price: parseMoney(firstAttrs.price),
        compareAtPrice: parseMoney(firstAttrs.compareAtPrice),
        currency: (firstAttrs.currency as string) || "USD",
      }
    : null;
  const stockUi = productStockUi(product.attributes);

  function variantAvailable(attrs: Record<string, unknown> | undefined): number {
    const a = inventoryAttributesFromVariant(attrs);
    if (!a) return 0;
    const n = a.available ?? a.onHand ?? 0;
    return Math.max(0, Number(n) || 0);
  }

  const firstAvail = firstVariant ? variantAvailable(firstVariant.attributes) : 0;
  const images = productGalleryImageUrls(product.attributes);
  const typeKey = product.attributes?.productType as string | undefined;
  const typeLabel = productTypeLabel(typeKey);
  const ageKey = product.attributes?.ageRange as string | undefined;
  const ageLabel = productAgeRangeLabel(ageKey);

  const imgUnopt = (url: string) =>
    url.includes("localhost") || url.includes("127.0.0.1");

  return (
    <main className="max-w-screen-xl mx-auto px-5 py-12 space-y-6">
      <Link href="/shop" className="underline text-sm">
        Back to store
      </Link>
      {images.length > 0 ? (
        <div className="max-w-2xl space-y-3">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-black/10 bg-gray-100">
            <Image
              src={images[0]}
              alt={product.attributes?.title || "Product"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
              unoptimized={imgUnopt(images[0])}
            />
          </div>
          {images.length > 1 ? (
            <ul className="flex flex-wrap gap-2">
              {images.slice(1).map((src, i) => (
                <li
                  key={`${src}-${i}`}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-gray-100"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized={imgUnopt(src)}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No images for this product yet.</p>
      )}
      {(typeLabel && typeKey) || (ageLabel && ageKey) ? (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {typeLabel && typeKey ? (
            <Link
              href={`/shop?productType=${encodeURIComponent(typeKey)}${ageKey ? `&ageRange=${encodeURIComponent(ageKey)}` : ""}`}
              className="font-semibold text-[#19C1B6] hover:underline"
            >
              {typeLabel}
            </Link>
          ) : null}
          {ageLabel && ageKey ? (
            <Link
              href={`/shop?ageRange=${encodeURIComponent(ageKey)}`}
              className="text-gray-700 hover:text-[#19C1B6] hover:underline"
            >
              Age: {ageLabel}
            </Link>
          ) : null}
        </p>
      ) : null}
      <h1 className="text-3xl font-bold">{product.attributes.title}</h1>
      <p className="text-gray-700">{product.attributes.shortDescription}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${stockBadgeClass(stockUi)}`}
        >
          {stockBadgeLabel(stockUi)}
        </span>
      </div>
      {variants.length > 1 ? (
        <ul className="space-y-2 rounded-xl border border-black/10 bg-white p-4">
          <li className="text-sm font-semibold text-gray-900">Options &amp; availability</li>
          {variants.map((v: { id: number; attributes?: Record<string, unknown> }) => {
            const a = v.attributes;
            const avail = variantAvailable(a);
            const title = (a?.title as string) || "Variant";
            const price = parseMoney(a?.price);
            const compareAt = parseMoney(a?.compareAtPrice);
            const currency = (a?.currency as string) || "USD";
            return (
              <li
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-2 text-sm first:border-t-0 first:pt-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">
                    {avail > 0 ? `${avail} in stock` : "Out of stock"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <StorefrontPriceRow
                    price={price}
                    compareAtPrice={compareAt}
                    currency={currency}
                    size="sm"
                    className="justify-end"
                  />
                  {avail > 0 ? (
                    <Link
                      href={`/shop/cart?variant=${v.id}`}
                      className="inline-flex rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Add
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <>
          {firstPricing ? (
            <StorefrontPriceRow
              price={firstPricing.price}
              compareAtPrice={firstPricing.compareAtPrice}
              currency={firstPricing.currency}
              size="lg"
            />
          ) : null}
          {firstAvail > 0 ? (
            <Link
              href={`/shop/cart?variant=${firstVariant?.id || ""}`}
              className="inline-flex bg-black text-white rounded px-4 py-2"
            >
              Add to cart
            </Link>
          ) : (
            <p className="text-sm font-medium text-red-700">Out of stock — cannot add to cart</p>
          )}
        </>
      )}
    </main>
  );
}
