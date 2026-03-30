import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminAuthError,
  requirePortalStrapiSession,
  strapiAdminFetch,
} from "lib/admin-strapi";
import { canManageProducts } from "lib/portal-roles";

const patchSchema = z
  .object({
    price: z.coerce.number().min(0).optional(),
    compareAtPrice: z.coerce.number().min(0).optional(),
    title: z.string().min(1).max(200).optional(),
    sku: z.string().min(1).max(120).optional(),
    currency: z.enum(["USD", "IRR"]).optional(),
  })
  .refine((o) => Object.values(o).some((v) => v !== undefined), {
    message: "At least one field is required",
  });

type VariantAttrs = Record<string, unknown>;

function numAttr(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function readVariant(
  strapiJwt: string,
  id: string
): Promise<VariantAttrs | null> {
  const res = await strapiAdminFetch(`/api/product-variants/${id}?populate=product`, strapiJwt);
  if (!res.ok) return null;
  const json = await res.json().catch(() => ({}));
  return (json?.data?.attributes as VariantAttrs | undefined) ?? null;
}

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
    const body = patchSchema.parse(await req.json());

    const a = await readVariant(strapiJwt, id);
    if (!a) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const productRel = a.product as { data?: { id?: number } } | number | undefined;
    const productId =
      typeof productRel === "object" && productRel?.data?.id != null
        ? productRel.data.id
        : typeof productRel === "number"
          ? productRel
          : undefined;

    const merged: Record<string, unknown> = {
      title: body.title !== undefined ? body.title : String(a.title ?? ""),
      sku: body.sku !== undefined ? body.sku : String(a.sku ?? ""),
      price: body.price !== undefined ? body.price : numAttr(a.price),
      compareAtPrice:
        body.compareAtPrice !== undefined ? body.compareAtPrice : numAttr(a.compareAtPrice),
      currency:
        body.currency !== undefined ? body.currency : ((a.currency as string) || "USD"),
    };
    if (a.attributes != null) merged.attributes = a.attributes;
    if (a.weightInGrams != null) merged.weightInGrams = Number(a.weightInGrams);
    if (a.leadTimeDays != null) merged.leadTimeDays = Number(a.leadTimeDays);
    if (productId != null) merged.product = productId;

    const res = await strapiAdminFetch(`/api/product-variants/${id}`, strapiJwt, {
      method: "PUT",
      body: JSON.stringify({ data: merged }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error?.message ||
            payload?.message ||
            "Failed to update variant",
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
