import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminAuthError,
  requirePortalStrapiSession,
  strapiAdminFetch,
} from "lib/admin-strapi";
import { canManageProducts } from "lib/portal-roles";
import { normalizeDiscountCodeInput } from "lib/discount-code";

const patchSchema = z.object({
  code: z.string().min(1).optional(),
  label: z.string().optional().nullable(),
  discountType: z.enum(["percent", "fixed"]).optional(),
  amount: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
  minSubtotal: z.coerce.number().min(0).optional(),
  maxRedemptions: z.coerce.number().int().min(1).optional().nullable(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
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
    const body = patchSchema.parse(await req.json());

    const getRes = await strapiAdminFetch(`/api/discount-codes/${id}`, strapiJwt);
    const getJson = await getRes.json().catch(() => ({}));
    if (!getRes.ok) {
      return NextResponse.json(
        { error: getJson?.error?.message || "Not found" },
        { status: getRes.status }
      );
    }
    const a = getJson?.data?.attributes as Record<string, unknown> | undefined;
    if (!a) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let code = String(a.code ?? "");
    if (body.code !== undefined) {
      const c = normalizeDiscountCodeInput(body.code);
      if (!c) {
        return NextResponse.json({ error: "Invalid code" }, { status: 400 });
      }
      code = c;
    }

    const merged: Record<string, unknown> = {
      code,
      label: body.label !== undefined ? body.label : (a.label ?? null),
      discountType: body.discountType ?? a.discountType,
      amount: body.amount !== undefined ? body.amount : a.amount,
      isActive: body.isActive !== undefined ? body.isActive : a.isActive,
      minSubtotal: body.minSubtotal !== undefined ? body.minSubtotal : (a.minSubtotal ?? 0),
      maxRedemptions:
        body.maxRedemptions !== undefined ? body.maxRedemptions : (a.maxRedemptions ?? null),
      redemptionCount: a.redemptionCount ?? 0,
      startsAt: body.startsAt !== undefined ? body.startsAt : (a.startsAt ?? null),
      endsAt: body.endsAt !== undefined ? body.endsAt : (a.endsAt ?? null),
    };

    const res = await strapiAdminFetch(`/api/discount-codes/${id}`, strapiJwt, {
      method: "PUT",
      body: JSON.stringify({ data: merged }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: payload?.error?.message || payload?.message || "Update failed", details: payload },
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

    const res = await strapiAdminFetch(`/api/discount-codes/${id}`, strapiJwt, {
      method: "DELETE",
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error?.message ||
            payload?.message ||
            "Failed to delete discount code",
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
