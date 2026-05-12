import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminAuthError,
  requirePortalStrapiSession,
  strapiAdminFetch,
} from "lib/admin-strapi";
import { canManageProducts } from "lib/portal-roles";

const createSchema = z.object({
  variantId: z.coerce.number().int().positive(),
  onHand: z.coerce.number().int().min(0).optional().default(0),
});

/**
 * Create an inventory row for a variant (one-to-one). Fails if one already exists.
 */
export async function POST(req: NextRequest) {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageProducts(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const json = await req.json();
    const body = createSchema.parse(json);
    const onHand = body.onHand ?? 0;
    const data = {
      onHand,
      reserved: 0,
      available: Math.max(0, onHand),
      warehouseCode: "MAIN",
      variant: body.variantId,
    };

    const res = await strapiAdminFetch("/api/inventories", strapiJwt, {
      method: "POST",
      body: JSON.stringify({ data }),
    });
    const raw = await res.text();
    let payload: Record<string, unknown> = {};
    if (raw) {
      try {
        payload = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        payload = { rawBody: raw.slice(0, 500) };
      }
    }
    if (!res.ok) {
      const errObj = payload?.error as { message?: string } | undefined;
      return NextResponse.json(
        {
          error:
            (typeof errObj?.message === "string" && errObj.message) ||
            (typeof payload?.message === "string" && payload.message) ||
            `Strapi error (${res.status}${res.statusText ? ` ${res.statusText}` : ""})`,
          details: Object.keys(payload).length ? payload : { emptyResponse: true },
          strapiStatus: res.status,
        },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
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
