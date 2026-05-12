import type Stripe from "stripe";
import { strapiWebhookRequest } from "lib/shop-api";

export async function upsertStripePaymentForOrder(input: {
  orderId: string;
  providerPaymentId: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  amount: number;
  currency: string;
  meta?: Record<string, unknown>;
}) {
  const cur = input.currency.toUpperCase();
  await strapiWebhookRequest(`/api/payment-transactions/stripe-upsert`, {
    method: "POST",
    body: {
      data: {
        provider: "stripe",
        providerPaymentId: input.providerPaymentId,
        status: input.status,
        amount: input.amount,
        currency: cur === "IRR" ? "IRR" : "USD",
        meta: input.meta || {},
        order: Number(input.orderId),
      },
    },
  });
}

async function writeOpsEvents(input: {
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  recipient?: string;
}) {
  try {
    await strapiWebhookRequest(`/api/audit-logs`, {
      method: "POST",
      body: {
        data: {
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          details: input.details || {},
        },
      },
    });
  } catch {
    /* non-fatal */
  }

  if (input.recipient) {
    try {
      await strapiWebhookRequest(`/api/notification-events`, {
        method: "POST",
        body: {
          data: {
            channel: "email",
            recipient: input.recipient,
            templateKey: input.action,
            status: "queued",
            payload: input.details || {},
            relatedOrderId: input.entityId,
          },
        },
      });
    } catch {
      /* non-fatal */
    }
  }
}

async function bumpDiscountRedemptionFromSession(session: Stripe.Checkout.Session) {
  const discountMeta = session.metadata?.discountCodeId?.trim();
  if (!discountMeta) return;
  const rid = Number(discountMeta);
  if (!Number.isFinite(rid) || rid <= 0) return;
  try {
    const cur = (await strapiWebhookRequest(`/api/discount-codes/${rid}`)) as {
      data?: { attributes?: Record<string, unknown> };
    };
    const a = cur.data?.attributes;
    if (a) {
      const rc = Math.max(0, Math.floor(Number(a.redemptionCount) || 0));
      await strapiWebhookRequest(`/api/discount-codes/${rid}`, {
        method: "PUT",
        body: {
          data: {
            code: a.code,
            label: a.label ?? null,
            discountType: a.discountType,
            amount: a.amount,
            isActive: a.isActive,
            minSubtotal: a.minSubtotal ?? 0,
            maxRedemptions: a.maxRedemptions ?? null,
            redemptionCount: rc + 1,
            startsAt: a.startsAt ?? null,
            endsAt: a.endsAt ?? null,
          },
        },
      });
    }
  } catch {
    /* non-fatal */
  }
}

type ReconcileLineItem = {
  variantId: number;
  quantity: number;
  unitPrice: number;
  title: string;
};

function lineItemsFromStripeCheckoutSession(session: Stripe.Checkout.Session): ReconcileLineItem[] {
  const li = session.line_items;
  if (!li || typeof li !== "object") return [];
  const data = (li as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];

  const out: ReconcileLineItem[] = [];
  for (const raw of data) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Stripe.LineItem;
    const price = item.price;
    if (!price || typeof price !== "object") continue;
    const product = price.product;
    if (!product || typeof product !== "object" || product.deleted) continue;
    const meta = "metadata" in product ? (product as Stripe.Product).metadata : undefined;
    const variantRaw = meta?.variantId?.trim() ?? "";
    const variantId = Number(variantRaw);
    if (!Number.isFinite(variantId) || variantId <= 0) continue;

    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const title =
      typeof item.description === "string" && item.description.trim()
        ? item.description.trim()
        : typeof (product as Stripe.Product).name === "string" &&
            ((product as Stripe.Product).name || "").trim()
          ? String((product as Stripe.Product).name).trim()
          : "Item";

    const amount =
      typeof price.unit_amount === "number" && Number.isFinite(price.unit_amount)
        ? price.unit_amount
        : 0;
    if (amount < 0) continue;

    out.push({
      variantId,
      quantity: qty,
      unitPrice: amount,
      title,
    });
  }

  return out;
}

async function strapiOrderLineItemCount(orderId: string): Promise<number | null> {
  try {
    const payload = (await strapiWebhookRequest(
      `/api/orders/${orderId}?populate[items][fields][0]=id`
    )) as {
      data?: { attributes?: { items?: { data?: unknown[] } } };
    };
    const rows = payload?.data?.attributes?.items?.data;
    return Array.isArray(rows) ? rows.length : 0;
  } catch {
    return null;
  }
}

async function maybeReconcileStrapiOrderItemsFromStripeSession(
  orderId: string,
  session: Stripe.Checkout.Session
): Promise<void> {
  const count = await strapiOrderLineItemCount(orderId);
  if (count != null && count > 0) return;

  const lineItems = lineItemsFromStripeCheckoutSession(session);
  if (lineItems.length === 0) return;

  try {
    await strapiWebhookRequest(`/api/orders/${orderId}/reconcile-stripe-line-items`, {
      method: "POST",
      body: { lineItems },
    });
  } catch {
    /* non-fatal — entitlement may still be empty until manual repair */
  }
}

/**
 * Mark Strapi order paid + payment row (same as Stripe webhook path).
 * Idempotent enough: transition paid→paid may 400 from Strapi; caller may ignore.
 */
export async function fulfillStripeCheckoutSessionPaid(
  session: Stripe.Checkout.Session,
  source: "webhook" | "return_verify"
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (session.payment_status !== "paid") {
    return { ok: false, reason: `payment_status=${session.payment_status}` };
  }

  const rawId = session.metadata?.orderId ?? session.client_reference_id;
  const orderId =
    rawId != null && String(rawId).trim() !== "" ? String(rawId).trim() : "";
  if (!orderId) {
    return { ok: false, reason: "missing_order_id" };
  }

  try {
    await strapiWebhookRequest(`/api/orders/${orderId}/transition`, {
      method: "POST",
      body: {
        nextStatus: "paid",
        note:
          source === "webhook"
            ? "Paid via Stripe checkout.session.completed"
            : "Paid via Stripe return (verify-checkout)",
      },
    });
  } catch {
    /* already paid or invalid transition — still upsert payment for idempotency */
  }

  await maybeReconcileStrapiOrderItemsFromStripeSession(orderId, session);

  // Safety net: some environments may transition order to `paid` without creating
  // shipment (e.g. stale Strapi process/version mismatch). Ensure pending shipment exists.
  try {
    await strapiWebhookRequest(`/api/orders/${orderId}/shipment`, {
      method: "PATCH",
      body: {
        status: "pending",
      },
    });
  } catch {
    /* non-fatal: shipment endpoint may be unavailable in older deployments */
  }

  const paymentRef =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent &&
          typeof session.payment_intent === "object" &&
          "id" in session.payment_intent
        ? String((session.payment_intent as { id: string }).id)
        : session.id;

  await upsertStripePaymentForOrder({
    orderId,
    providerPaymentId: paymentRef,
    status: "succeeded",
    amount: (session.amount_total || 0) / 100,
    currency: session.currency || "usd",
    meta: { sessionId: session.id, source },
  });

  await writeOpsEvents({
    action:
      source === "webhook"
        ? "checkout.session.completed"
        : "checkout.return_verified",
    entityType: "order",
    entityId: `${orderId}`,
    recipient: session.customer_email || undefined,
    details: {
      stripeSessionId: session.id,
      paymentIntent: session.payment_intent,
    },
  });

  await bumpDiscountRedemptionFromSession(session);

  return { ok: true };
}
