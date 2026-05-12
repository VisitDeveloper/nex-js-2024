import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminAuthError,
  requirePortalStrapiSession,
  strapiAdminFetch,
} from "lib/admin-strapi";
import { canManageProducts } from "lib/portal-roles";
import { normalizeDiscountCodeInput } from "lib/discount-code";

const createSchema = z.object({
  code: z.string().min(1),
  label: z.string().optional(),
  discountType: z.enum(["percent", "fixed"]),
  amount: z.coerce.number().min(0),
  isActive: z.boolean().optional(),
  minSubtotal: z.coerce.number().min(0).optional(),
  maxRedemptions: z.coerce.number().int().min(1).optional().nullable(),
  startsAt: z.string().optional().nullable(),
  endsAt: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageProducts(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const res = await strapiAdminFetch(
      "/api/discount-codes?pagination[pageSize]=200&sort=code:asc",
      strapiJwt
    );
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: payload?.error?.message || payload?.message || "Failed to load" },
        { status: res.status }
      );
    }
    return NextResponse.json(payload);
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageProducts(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = createSchema.parse(await req.json());
    const code = normalizeDiscountCodeInput(body.code);
    if (!code) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    const data: Record<string, unknown> = {
      code,
      discountType: body.discountType,
      amount: body.amount,
      isActive: body.isActive ?? true,
      redemptionCount: 0,
      minSubtotal: body.minSubtotal ?? 0,
    };
    if (body.label) data.label = body.label;
    if (body.maxRedemptions != null) data.maxRedemptions = body.maxRedemptions;
    if (body.startsAt) data.startsAt = body.startsAt;
    if (body.endsAt) data.endsAt = body.endsAt;

    const res = await strapiAdminFetch("/api/discount-codes", strapiJwt, {
      method: "POST",
      body: JSON.stringify({ data }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: payload?.error?.message || payload?.message || "Create failed", details: payload },
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
