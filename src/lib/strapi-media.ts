/**
 * Resolve Strapi v4 REST media (upload) to an absolute URL for next/image.
 */

import { getStrapiOrigin } from "lib/strapi-origin";

function pickUrlFromAttributes(attrs: Record<string, unknown> | undefined): string | null {
  if (!attrs) return null;
  const formats = attrs.formats as Record<string, { url?: string }> | undefined;
  const fromFormats =
    formats?.small?.url || formats?.thumbnail?.url || formats?.medium?.url;
  const direct = attrs.url as string | undefined;
  return fromFormats || direct || null;
}

export function strapiCoverUrl(cover: unknown): string | null {
  const data = (cover as { data?: { attributes?: Record<string, unknown> } | null })?.data;
  if (!data || Array.isArray(data)) return null;
  return pickUrlFromAttributes(data.attributes);
}

export function strapiGalleryFirstUrl(gallery: unknown): string | null {
  const data = (gallery as { data?: { attributes?: Record<string, unknown> }[] })?.data;
  const first = data?.[0]?.attributes;
  return pickUrlFromAttributes(first);
}

export function absoluteStrapiAssetUrl(relativeOrAbsolute: string | null | undefined): string | null {
  if (!relativeOrAbsolute) return null;
  if (relativeOrAbsolute.startsWith("http://") || relativeOrAbsolute.startsWith("https://")) {
    return relativeOrAbsolute;
  }
  const base = getStrapiOrigin();
  if (!base) return null;
  const path = relativeOrAbsolute.startsWith("/") ? relativeOrAbsolute : `/${relativeOrAbsolute}`;
  return `${base}${path}`;
}

export function productListImageUrl(attributes: Record<string, unknown> | undefined): string | null {
  if (!attributes) return null;
  const cover = strapiCoverUrl(attributes.cover);
  const gallery = strapiGalleryFirstUrl(attributes.gallery);
  return absoluteStrapiAssetUrl(cover || gallery);
}

/** Cover first, then gallery items; deduped absolute URLs for storefront galleries. */
export function productGalleryImageUrls(attributes: Record<string, unknown> | undefined): string[] {
  if (!attributes) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (relativeOrAbsolute: string | null | undefined) => {
    const abs = absoluteStrapiAssetUrl(relativeOrAbsolute);
    if (!abs || seen.has(abs)) return;
    seen.add(abs);
    out.push(abs);
  };
  const cover = (attributes.cover as { data?: { attributes?: Record<string, unknown> } | null })?.data;
  if (cover && !Array.isArray(cover)) {
    add(pickUrlFromAttributes(cover.attributes));
  }
  const gallery = (attributes.gallery as { data?: { attributes?: Record<string, unknown> }[] })?.data;
  for (const item of gallery || []) {
    add(pickUrlFromAttributes(item.attributes));
  }
  return out;
}

/** Category `cover` media → absolute image URL for admin / storefront. */
export function categoryCoverImageUrl(attributes: Record<string, unknown> | undefined): string | null {
  if (!attributes?.cover) return null;
  return absoluteStrapiAssetUrl(strapiCoverUrl(attributes.cover));
}

/**
 * Client-safe blog card / hero image: Strapi relative URL → absolute, or placeholder.
 */
export function publicArticleCoverSrc(
  attributes: { cover?: unknown } | Record<string, unknown> | undefined
): string {
  const rel = strapiCoverUrl(attributes?.cover as unknown);
  if (!rel) return "/hero-image.svg";
  const fromApiBase = absoluteStrapiAssetUrl(rel);
  if (fromApiBase) return fromApiBase;
  const imgBase = (process.env.NEXT_PUBLIC_BASE_IMAGE_URL || "").replace(/\/$/, "");
  if (imgBase) {
    return `${imgBase}${rel.startsWith("/") ? "" : "/"}${rel}`;
  }
  return rel.startsWith("/") ? rel : `/${rel}`;
}
