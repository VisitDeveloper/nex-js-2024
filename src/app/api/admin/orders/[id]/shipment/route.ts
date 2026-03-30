import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminAuthError,
  requirePortalStrapiSession,
  strapiAdminFetch,
  strapiCheckoutWebhookHeaders,
} from "lib/admin-strapi";
import {
  orderShipmentSummaryFromStrapiEntity,
  type OrderShipmentSummary,
} from "lib/order-shipment";
import { canManageOrders } from "lib/portal-roles";

const patchSchema = z.object({
  status: z.enum(["pending", "packed", "in_transit", "delivered", "failed"]).optional(),
  carrier: z.string().max(255).nullable().optional(),
  trackingCode: z.string().max(255).nullable().optional(),
  shippedAt: z.string().max(40).nullable().optional(),
  deliveredAt: z.string().max(40).nullable().optional(),
});

export async function PATCH(
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
    const body = patchSchema.parse(json);

    const payload: Record<string, unknown> = {};
    if (body.status !== undefined) payload.status = body.status;
    if (body.carrier !== undefined) payload.carrier = body.carrier;
    if (body.trackingCode !== undefined) payload.trackingCode = body.trackingCode;
    if (body.shippedAt !== undefined) payload.shippedAt = body.shippedAt;
    if (body.deliveredAt !== undefined) payload.deliveredAt = body.deliveredAt;

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No shipment fields provided" }, { status: 400 });
    }

    const wh = strapiCheckoutWebhookHeaders();
    if (!wh["x-brainwave-checkout-secret"]) {
      return NextResponse.json(
        {
          error:
            "BRAINWAVE_CHECKOUT_WEBHOOK_SECRET is not set on the Next server (same value as Strapi). Required to update shipment.",
        },
        { status: 500 }
      );
    }

    const res = await strapiAdminFetch(`/api/orders/${id}/shipment`, strapiJwt, {
      method: "PATCH",
      headers: wh,
      body: JSON.stringify(payload),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errObj =
        typeof out === "object" && out !== null ? (out as { error?: { message?: string } }) : null;
      const msg =
        (errObj?.error && typeof errObj.error.message === "string" ? errObj.error.message : null) ||
        (typeof out === "object" && out !== null && "message" in out
          ? String((out as { message?: unknown }).message)
          : null) ||
        "Shipment update failed";
      return NextResponse.json({ error: msg, details: out }, { status: res.status });
    }
    const dataPayload = out as { data?: unknown };
    const fromEntity = orderShipmentSummaryFromStrapiEntity(dataPayload?.data);
    const fallback: OrderShipmentSummary = {
      carrier: body.carrier ?? null,
      trackingCode: body.trackingCode ?? null,
      status: body.status ?? null,
      shippedAt: body.shippedAt ?? null,
      deliveredAt: body.deliveredAt ?? null,
    };
    const shipmentSummary = fromEntity ?? fallback;
    return NextResponse.json({ ...out, shipmentSummary });
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
