import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminAuthError,
  requirePortalStrapiSession,
  strapiAdminFetch,
} from "lib/admin-strapi";
import { canManageProducts } from "lib/portal-roles";
import { PRODUCT_AGE_RANGE_KEYS } from "lib/product-age-range";

const ageRangeSchema = z.enum(PRODUCT_AGE_RANGE_KEYS);

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  shortDescription: z.string().max(320).optional(),
  description: z.string().optional(),
  productType: z
    .enum(["robot", "robot-part", "three-d-print", "accessory"])
    .optional(),
  slug: z.string().optional(),
  category: z.coerce.number().nullable().optional(),
  isActive: z.boolean().optional(),
  cover: z.coerce.number().nullable().optional(),
  gallery: z.array(z.coerce.number()).optional(),
  ageRange: ageRangeSchema.nullable().optional(),
  packagingPrice: z.coerce.number().min(0).optional(),
  shippingPrice: z.coerce.number().min(0).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageProducts(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const json = await req.json();
    const body = patchSchema.parse(json);
    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.shortDescription !== undefined) {
      data.shortDescription = body.shortDescription;
    }
    if (body.description !== undefined) data.description = body.description;
    if (body.productType !== undefined) data.productType = body.productType;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.category !== undefined) data.category = body.category;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.cover !== undefined) data.cover = body.cover;
    if (body.gallery !== undefined) data.gallery = body.gallery;
    if (body.ageRange !== undefined) data.ageRange = body.ageRange;
    if (body.packagingPrice !== undefined) data.packagingPrice = body.packagingPrice;
    if (body.shippingPrice !== undefined) data.shippingPrice = body.shippingPrice;

    const res = await strapiAdminFetch(`/api/products/${id}?locale=en`, strapiJwt, {
      method: "PUT",
      body: JSON.stringify({ data }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error?.message ||
            payload?.message ||
            "Failed to update product",
          details: payload,
        },
        { status: res.status }
      );
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

type StrapiListRow = {
  id: number;
  attributes?: {
    inventory?: { data?: { id?: number } | null };
  };
};

async function listVariantsForProduct(
  strapiJwt: string,
  productId: string
): Promise<StrapiListRow[]> {
  const qs = new URLSearchParams();
  qs.set("filters[product][id][$eq]", productId);
  qs.set("populate[inventory]", "true");
  qs.set("pagination[pageSize]", "100");
  const res = await strapiAdminFetch(`/api/product-variants?${qs.toString()}`, strapiJwt);
  if (!res.ok) return [];
  const json = await res.json().catch(() => ({}));
  return Array.isArray(json?.data) ? json.data : [];
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageProducts(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const variants = await listVariantsForProduct(strapiJwt, id);
    for (const row of variants) {
      const invId = row.attributes?.inventory?.data?.id;
      if (invId != null) {
        const invRes = await strapiAdminFetch(`/api/inventories/${invId}`, strapiJwt, {
          method: "DELETE",
        });
        if (!invRes.ok) {
          const payload = await invRes.json().catch(() => ({}));
          return NextResponse.json(
            {
              error:
                payload?.error?.message ||
                payload?.message ||
                "Failed to delete inventory for a variant",
              details: payload,
            },
            { status: invRes.status }
          );
        }
      }
      const vRes = await strapiAdminFetch(`/api/product-variants/${row.id}`, strapiJwt, {
        method: "DELETE",
      });
      if (!vRes.ok) {
        const payload = await vRes.json().catch(() => ({}));
        return NextResponse.json(
          {
            error:
              payload?.error?.message ||
              payload?.message ||
              "Failed to delete a product variant",
            details: payload,
          },
          { status: vRes.status }
        );
      }
    }

    const res = await strapiAdminFetch(`/api/products/${id}?locale=en`, strapiJwt, {
      method: "DELETE",
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error?.message ||
            payload?.message ||
            "Failed to delete product",
          details: payload,
        },
        { status: res.status }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
