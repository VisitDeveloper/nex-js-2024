import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminAuthError,
  requirePortalStrapiSession,
  strapiAdminFetch,
} from "lib/admin-strapi";
import { canManageProducts } from "lib/portal-roles";
import { PRODUCT_AGE_RANGE_KEYS } from "lib/product-age-range";
import { strapiErrorMessage } from "lib/strapi-error-message";

const ageRangeSchema = z.enum(PRODUCT_AGE_RANGE_KEYS);

const createVariantSchema = z.object({
  title: z.string().max(200).optional(),
  sku: z.string().min(1).max(120).optional(),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional().default(0),
  currency: z.enum(["USD", "IRR"]).optional().default("USD"),
  onHand: z.coerce.number().int().min(0).optional().default(0),
});

const createSchema = z.object({
  title: z.string().min(1),
  shortDescription: z.string().max(320).optional(),
  description: z.string().optional(),
  productType: z
    .enum(["robot", "robot-part", "three-d-print", "accessory"])
    .optional(),
  slug: z.string().optional(),
  category: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
  cover: z.coerce.number().optional(),
  gallery: z.array(z.coerce.number()).optional(),
  ageRange: ageRangeSchema.optional(),
  packagingPrice: z.coerce.number().min(0).optional(),
  shippingPrice: z.coerce.number().min(0).optional(),
  /** When set, creates one default product variant + inventory row after the product. */
  variant: createVariantSchema.optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageProducts(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const json = await req.json();
    const body = createSchema.parse(json);

    const data: Record<string, unknown> = {
      title: body.title,
      isActive: body.isActive ?? true,
      publishedAt: new Date().toISOString(),
    };
    if (body.shortDescription) data.shortDescription = body.shortDescription;
    if (body.description) data.description = body.description;
    if (body.productType) data.productType = body.productType;
    if (body.slug) data.slug = body.slug;
    if (body.category) data.category = body.category;
    if (body.cover != null) data.cover = body.cover;
    if (body.gallery?.length) data.gallery = body.gallery;
    if (body.ageRange) data.ageRange = body.ageRange;
    if (body.packagingPrice != null) data.packagingPrice = body.packagingPrice;
    if (body.shippingPrice != null) data.shippingPrice = body.shippingPrice;

    const res = await strapiAdminFetch("/api/products?locale=en", strapiJwt, {
      method: "POST",
      body: JSON.stringify({ data }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error?.message ||
            payload?.message ||
            "Failed to create product",
          details: payload,
        },
        { status: res.status }
      );
    }

    const productId = payload?.data?.id as number | undefined;
    const attrs = payload?.data?.attributes as { slug?: string } | undefined;
    const productSlug = typeof attrs?.slug === "string" ? attrs.slug : "";

    if (body.variant && productId != null) {
      const v = body.variant;
      const skuBase = (productSlug || `p${productId}`).replace(/\s+/g, "-");
      const sanitizedBase = skuBase
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      /** Always suffix product id so auto SKUs stay unique (Strapi sku is globally unique). */
      const sku = v.sku?.trim()
        ? v.sku.trim().slice(0, 120)
        : `SKU-${sanitizedBase || "P"}-${productId}`.slice(0, 120);
      const variantTitle = v.title?.trim() || body.title;

      let varRes = await strapiAdminFetch("/api/product-variants", strapiJwt, {
        method: "POST",
        body: JSON.stringify({
          data: {
            title: variantTitle,
            sku,
            price: v.price,
            compareAtPrice: v.compareAtPrice ?? 0,
            currency: v.currency ?? "USD",
            product: productId,
          },
        }),
      });
      let varPayload = await varRes.json().catch(() => ({}));
      /** Strapi custom route: same /api/products prefix when gateways block POST /api/product-variants. */
      let variantAndInventoryViaPortal = false;
      if (!varRes.ok && (varRes.status === 405 || varRes.status === 404)) {
        varRes = await strapiAdminFetch(`/api/products/${productId}/create-variant`, strapiJwt, {
          method: "POST",
          body: JSON.stringify({
            data: {
              title: variantTitle,
              sku,
              price: v.price,
              compareAtPrice: v.compareAtPrice ?? 0,
              currency: v.currency ?? "USD",
              onHand: v.onHand ?? 0,
            },
          }),
        });
        varPayload = await varRes.json().catch(() => ({}));
        variantAndInventoryViaPortal = varRes.ok;
      }

      if (!varRes.ok) {
        await strapiAdminFetch(`/api/products/${productId}?locale=en`, strapiJwt, {
          method: "DELETE",
        });
        let msg =
          strapiErrorMessage(varPayload) ||
          (varRes.status
            ? `Product was rolled back: Strapi returned ${varRes.status} ${varRes.statusText || ""} when creating variant`
            : "Product was rolled back: failed to create variant");
        if (varRes.status === 405) {
          msg +=
            " If Strapi is up to date, redeploy backend so POST /api/products/:id/create-variant is available; otherwise fix STRAPI_API_URL (origin only, no /api) or allow POST /api/product-variants on your proxy.";
        }
        return NextResponse.json(
          {
            error: msg,
            details: varPayload,
          },
          { status: varRes.status }
        );
      }
      const variantId = varPayload?.data?.id as number | undefined;
      if (variantId == null) {
        await strapiAdminFetch(`/api/products/${productId}?locale=en`, strapiJwt, {
          method: "DELETE",
        });
        return NextResponse.json(
          { error: "Product was rolled back: invalid variant response" },
          { status: 500 }
        );
      }

      if (!variantAndInventoryViaPortal) {
        const onHand = v.onHand ?? 0;
        const invRes = await strapiAdminFetch("/api/inventories", strapiJwt, {
          method: "POST",
          body: JSON.stringify({
            data: {
              onHand,
              reserved: 0,
              available: Math.max(0, onHand),
              warehouseCode: "MAIN",
              variant: variantId,
            },
          }),
        });
        const invPayload = await invRes.json().catch(() => ({}));
        if (!invRes.ok) {
          await strapiAdminFetch(`/api/product-variants/${variantId}`, strapiJwt, {
            method: "DELETE",
          });
          await strapiAdminFetch(`/api/products/${productId}?locale=en`, strapiJwt, {
            method: "DELETE",
          });
          const invMsg =
            strapiErrorMessage(invPayload) ||
            "Product was rolled back: failed to create inventory";
          return NextResponse.json(
            {
              error: invMsg,
              details: invPayload,
            },
            { status: invRes.status }
          );
        }
      }
    }

    return NextResponse.json(payload);
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", issues: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
