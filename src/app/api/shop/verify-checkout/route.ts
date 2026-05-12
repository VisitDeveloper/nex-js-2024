import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { COOKIE_NAME } from "config/constant";
import { verifyAppJwt } from "lib/auth-session";
import { fulfillStripeCheckoutSessionPaid } from "lib/stripe-checkout-fulfillment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

function isUsableStripeSecretKey(key: string): boolean {
  const k = key.trim();
  if (!k) return false;
  const lower = k.toLowerCase();
  if (lower === "sk_test_xxx" || lower === "sk_live_xxx") return false;
  if (!/^sk_(test|live)_/.test(k)) return false;
  if (lower.includes("xxx") || lower.includes("your_key") || lower.includes("placeholder")) return false;
  if (/\.\.\./.test(k)) return false;
  if (k.length < 80) return false;
  return true;
}

/**
 * After returning from Stripe Checkout, the browser calls this with session_id so the order
 * becomes paid even when the Stripe webhook did not reach localhost (e.g. missing `stripe listen --forward-to`).
 */
export async function POST(req: NextRequest) {
  const checkoutHookSecret = process.env.BRAINWAVE_CHECKOUT_WEBHOOK_SECRET?.trim();
  if (!checkoutHookSecret) {
    return NextResponse.json(
      { error: "BRAINWAVE_CHECKOUT_WEBHOOK_SECRET is not configured" },
      { status: 500 }
    );
  }

  if (!isUsableStripeSecretKey(stripeSecretKey)) {
    return NextResponse.json({ error: "Stripe is not configured for live checkout" }, { status: 503 });
  }

  const jar = cookies();
  const appJwt = jar.get(COOKIE_NAME)?.value;
  const sessionUser = appJwt ? verifyAppJwt(appJwt) : null;
  if (!sessionUser) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const sessionId =
    body &&
    typeof body === "object" &&
    "sessionId" in body &&
    typeof (body as { sessionId: unknown }).sessionId === "string"
      ? (body as { sessionId: string }).sessionId.trim()
      : "";
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "sessionId required (Stripe Checkout Session id)" }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2026-03-25.dahlia",
  });

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent", "line_items.data.price.product"],
  });

  const cust = session.customer_email?.toLowerCase().trim();
  const userEmail = sessionUser.email.toLowerCase().trim();
  if (cust && cust !== userEmail) {
    return NextResponse.json({ error: "This payment does not match your account" }, { status: 403 });
  }

  const result = await fulfillStripeCheckoutSessionPaid(session, "return_verify");
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, reason: result.reason },
      { status: result.reason === "missing_order_id" ? 422 : 400 }
    );
  }

  console.info("[verify-checkout] fulfilled session=", sessionId);
  return NextResponse.json({ ok: true });
}
