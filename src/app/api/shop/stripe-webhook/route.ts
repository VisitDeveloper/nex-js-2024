import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { strapiWebhookRequest } from "lib/shop-api";
import { fulfillStripeCheckoutSessionPaid } from "lib/stripe-checkout-fulfillment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/** Lets you verify this URL is handled by Next (not rewritten). GET /api/shop/stripe-webhook */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "brainwave-academy-stripe-webhook",
    hint: "Stripe sends POST only; use stripe listen --forward-to <origin>/api/shop/stripe-webhook",
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
    /* non-fatal: order/payment already updated */
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

export async function POST(req: NextRequest) {
  console.info("[stripe-webhook] POST received");

  if (!stripeSecretKey || !webhookSecret) {
    console.error("[stripe-webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Stripe webhook env vars are missing" },
      { status: 500 }
    );
  }

  const checkoutHookSecret = process.env.BRAINWAVE_CHECKOUT_WEBHOOK_SECRET?.trim();
  if (!checkoutHookSecret) {
    console.error("[stripe-webhook] BRAINWAVE_CHECKOUT_WEBHOOK_SECRET is missing — Strapi will reject updates");
    return NextResponse.json(
      {
        error:
          "BRAINWAVE_CHECKOUT_WEBHOOK_SECRET must be set (same value in Strapi .env) to update orders after payment.",
      },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2026-03-25.dahlia",
  });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    console.error("[stripe-webhook] Missing Stripe-Signature header (not a Stripe request?)");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const rawBody = await req.text();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (verifyErr) {
      console.error(
        "[stripe-webhook] Signature verification failed — STRIPE_WEBHOOK_SECRET must match `stripe listen` output (whsec_...):",
        verifyErr instanceof Error ? verifyErr.message : verifyErr
      );
      throw verifyErr;
    }

    console.info("[stripe-webhook] event verified:", event.type, event.id);

    if (event.type === "checkout.session.completed") {
      const thin = event.data.object as Stripe.Checkout.Session;
      const session = await stripe.checkout.sessions.retrieve(thin.id, {
        expand: ["payment_intent", "line_items.data.price.product"],
      });
      const result = await fulfillStripeCheckoutSessionPaid(session, "webhook");
      if (!result.ok) {
        console.error(
          "[stripe-webhook] fulfill failed:",
          result.reason,
          "session=",
          session.id
        );
      } else {
        console.info("[stripe-webhook] fulfill ok, session=", session.id);
      }
    }

    if (event.type === "checkout.session.expired") {
      const thinEx = event.data.object as Stripe.Checkout.Session;
      const session = await stripe.checkout.sessions.retrieve(thinEx.id);
      const rawId = session.metadata?.orderId ?? session.client_reference_id;
      const orderId =
        rawId != null && String(rawId).trim() !== "" ? String(rawId).trim() : "";
      if (orderId) {
        await strapiWebhookRequest(`/api/orders/${orderId}/transition`, {
          method: "POST",
          body: {
            nextStatus: "payment_failed",
            note: "Stripe checkout session expired",
          },
        });
        await writeOpsEvents({
          action: "checkout.session.expired",
          entityType: "order",
          entityId: `${orderId}`,
          recipient: session.customer_email || undefined,
        });
      }
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const orderId = (charge.metadata?.orderId || "").toString();
      if (orderId) {
        await strapiWebhookRequest(`/api/orders/${orderId}/transition`, {
          method: "POST",
          body: {
            nextStatus: "refunded",
            note: "Stripe charge refunded",
          },
        });
        await writeOpsEvents({
          action: "charge.refunded",
          entityType: "order",
          entityId: `${orderId}`,
          details: {
            chargeId: charge.id,
            amountRefunded: charge.amount_refunded,
          },
        });
      }
    }

    console.info("[stripe-webhook] done OK");
    return NextResponse.json({ received: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[stripe-webhook] FAILED:", msg, stack || "");
    return NextResponse.json(
      { error: msg },
      { status: 400 }
    );
  }
}
