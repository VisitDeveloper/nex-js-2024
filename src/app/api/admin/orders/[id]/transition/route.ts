import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminAuthError,
  requirePortalStrapiSession,
  strapiAdminFetch,
  strapiCheckoutWebhookHeaders,
} from "lib/admin-strapi";
import { canManageOrders } from "lib/portal-roles";

const bodySchema = z.object({
  nextStatus: z.string().min(1),
  note: z.string().max(2000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageOrders(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const id = params.id?.trim();
    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }
    const json = await req.json();
    const body = bodySchema.parse(json);

    const wh = strapiCheckoutWebhookHeaders();
    if (!wh["x-brainwave-checkout-secret"]) {
      return NextResponse.json(
        {
          error:
            "BRAINWAVE_CHECKOUT_WEBHOOK_SECRET is not set on the Next server (same value as Strapi). Required to update order status.",
        },
        { status: 500 }
      );
    }

    const res = await strapiAdminFetch(`/api/orders/${id}/transition`, strapiJwt, {
      method: "POST",
      headers: wh,
      body: JSON.stringify({
        nextStatus: body.nextStatus,
        ...(body.note != null && body.note !== "" ? { note: body.note } : {}),
      }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errObj =
        typeof payload === "object" && payload !== null
          ? (payload as { error?: { message?: string }; message?: unknown })
          : null;
      const msg =
        (errObj?.error && typeof errObj.error.message === "string" ? errObj.error.message : null) ||
        (typeof errObj?.message === "string" ? errObj.message : null) ||
        "Transition failed";
      return NextResponse.json(
        {
          error: msg,
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
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
