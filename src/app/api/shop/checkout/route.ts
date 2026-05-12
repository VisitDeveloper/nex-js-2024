import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { COOKIE_NAME, STRAPI_JWT_COOKIE } from "config/constant";
import { verifyAppJwt } from "lib/auth-session";
import { getStrapiOrigin } from "lib/strapi-origin";
import { strapiRequest, toStripeAmount } from "lib/shop-api";
import {
  validateDiscountAgainstSubtotal,
  type DiscountCodeAttrs,
} from "lib/discount-code";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

/**
 * Real Stripe secret keys are long (typically 100+ chars). Placeholders like sk_test_xxx must not hit the API.
 */
function isUsableStripeSecretKey(key: string): boolean {
  const k = key.trim();
  if (!k) return false;
  const lower = k.toLowerCase();
  if (lower === "sk_test_xxx" || lower === "sk_live_xxx") return false;
  if (!/^sk_(test|live)_/.test(k)) return false;
  if (lower.includes("xxx") || lower.includes("your_key") || lower.includes("placeholder")) return false;
  if (/\.\.\./.test(k)) return false;
  // Tutorial / .env.example values are short; production keys are not.
  if (k.length < 80) return false;
  return true;
}

/** Demo / dev: missing key, placeholder key, or SHOP_CHECKOUT_MOCK=true. Set SHOP_CHECKOUT_MOCK=false only with a real secret key. */
function useMockCheckout(): boolean {
  if (process.env.SHOP_CHECKOUT_MOCK === "true") return true;
  if (process.env.SHOP_CHECKOUT_MOCK === "false") return false;
  return !isUsableStripeSecretKey(stripeSecretKey);
}

type LineItem = {
  title: string;
  quantity: number;
  unitPrice: number;
  variantId: number;
};

type CheckoutBody = {
  lineItems?: LineItem[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  shippingAddressId?: number | null;
  discountCodeId?: number | null;
  resumeOrderId?: number | null;
};

async function stripeCouponsFromDiscountCode(
  stripe: Stripe,
  discountCodeId: number,
  subtotalCents: number
): Promise<
  | { ok: true; discounts: Stripe.Checkout.SessionCreateParams.Discount[]; metaDiscountId: string }
  | { ok: false; message: string }
> {
  let dcPayload: { data?: { attributes?: DiscountCodeAttrs } };
  try {
    dcPayload = (await strapiRequest(
      `/api/discount-codes/${discountCodeId}`
    )) as typeof dcPayload;
  } catch {
    return { ok: false, message: "Discount code is no longer valid." };
  }
  const attrs = dcPayload.data?.attributes;
  const v = validateDiscountAgainstSubtotal(attrs, subtotalCents);
  if (!v.ok) {
    return { ok: false, message: v.message };
  }

  if (attrs?.discountType === "fixed") {
    const amountOff = Math.min(subtotalCents, v.discountCents);
    if (amountOff <= 0) {
      return { ok: false, message: "Discount could not be applied." };
    }
    const coupon = await stripe.coupons.create({
      amount_off: amountOff,
      currency: "usd",
      duration: "once",
      name: `Discount ${attrs?.code ?? discountCodeId}`,
    });
    return {
      ok: true,
      discounts: [{ coupon: coupon.id }],
      metaDiscountId: String(discountCodeId),
    };
  }

  const pct = Math.min(
    100,
    Math.max(0, Math.round(Number(attrs?.amount) || 0))
  );
  if (pct <= 0) {
    return { ok: false, message: "Discount could not be applied." };
  }
  const coupon = await stripe.coupons.create({
    percent_off: pct,
    duration: "once",
    name: `Discount ${attrs?.code ?? discountCodeId}`,
  });
  return {
    ok: true,
    discounts: [{ coupon: coupon.id }],
    metaDiscountId: String(discountCodeId),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody;
    const {
      lineItems: rawLineItems,
      successUrl,
      cancelUrl,
      customerEmail,
      shippingAddressId: rawShippingAddressId,
      discountCodeId: bodyDiscountCodeId,
      resumeOrderId: rawResumeId,
    } = body;

    const resumeOrderId =
      rawResumeId != null && Number.isFinite(Number(rawResumeId))
        ? Number(rawResumeId)
        : null;
    const shippingAddressId =
      rawShippingAddressId != null && Number.isFinite(Number(rawShippingAddressId))
        ? Number(rawShippingAddressId)
        : null;

    if (
      typeof successUrl !== "string" ||
      typeof cancelUrl !== "string" ||
      !successUrl.trim() ||
      !cancelUrl.trim()
    ) {
      return NextResponse.json(
        { error: "successUrl and cancelUrl are required" },
        { status: 400 }
      );
    }

    if (resumeOrderId == null && (shippingAddressId == null || shippingAddressId <= 0)) {
      return NextResponse.json(
        { error: "A saved shipping address is required." },
        { status: 400 }
      );
    }

    if (useMockCheckout()) {
      if (resumeOrderId != null) {
        return NextResponse.json(
          { error: "Resuming checkout requires Stripe (not demo mode)." },
          { status: 400 }
        );
      }
      if (!Array.isArray(rawLineItems) || rawLineItems.length === 0) {
        return NextResponse.json(
          { error: "Invalid checkout payload" },
          { status: 400 }
        );
      }

      const origin = new URL(req.url).origin;
      const jar = cookies();
      const appJwt = jar.get(COOKIE_NAME)?.value;
      const strapiJwt = jar.get(STRAPI_JWT_COOKIE)?.value?.trim();
      const sessionUser = appJwt ? verifyAppJwt(appJwt) : null;
      const strapiBase = getStrapiOrigin()?.replace(/\/$/, "");

      if (sessionUser && strapiJwt && strapiBase) {
        try {
          const mockRes = await fetch(`${strapiBase}/api/orders/checkout-mock-paid`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${strapiJwt}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lineItems: rawLineItems,
              ...(shippingAddressId != null ? { shippingAddressId } : {}),
              ...(bodyDiscountCodeId != null && bodyDiscountCodeId > 0
                ? { discountCodeId: bodyDiscountCodeId }
                : {}),
            }),
            cache: "no-store",
          });
          if (!mockRes.ok) {
            const errBody = await mockRes.text().catch(() => "");
            console.warn(
              "[shop/checkout] mock Strapi order failed:",
              mockRes.status,
              errBody.slice(0, 500)
            );
          }
        } catch (e) {
          console.warn("[shop/checkout] mock Strapi order error:", e);
        }
      }

      return NextResponse.json({
        id: `mock_cs_${Date.now()}`,
        url: `${origin}/shop/checkout/mock-success`,
      });
    }

    const jar = cookies();
    const appJwt = jar.get(COOKIE_NAME)?.value;
    const strapiJwt = jar.get(STRAPI_JWT_COOKIE)?.value?.trim();
    const sessionUser = appJwt ? verifyAppJwt(appJwt) : null;
    if (!sessionUser || !strapiJwt) {
      return NextResponse.json(
        { error: "Sign in to complete checkout." },
        { status: 401 }
      );
    }

    const strapiBase = getStrapiOrigin()?.replace(/\/$/, "");
    if (!strapiBase) {
      return NextResponse.json(
        { error: "Shop backend is not configured." },
        { status: 503 }
      );
    }

    let lineItems: LineItem[];
    let orderId: number;
    let orderNumber: string;
    let discountCentsFallback = 0;
    let discountCodeId: number | null = null;
    let feeCentsFallback = 0;
    let feeCents = 0;

    if (resumeOrderId != null) {
      const resumeRes = await fetch(
        `${strapiBase}/api/orders/${resumeOrderId}/checkout-resume`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${strapiJwt}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      if (!resumeRes.ok) {
        let message = "Could not resume checkout.";
        try {
          const errBody = (await resumeRes.json()) as {
            error?: { message?: string };
            message?: string;
          };
          message =
            errBody?.error?.message || errBody?.message || message;
        } catch {
          const text = await resumeRes.text().catch(() => "");
          if (text) message = text.slice(0, 200);
        }
        return NextResponse.json(
          { error: message },
          {
            status:
              resumeRes.status >= 400 && resumeRes.status < 600
                ? resumeRes.status
                : 400,
          }
        );
      }

      const resumeJson = (await resumeRes.json()) as {
        data?: {
          id?: number;
          orderNumber?: string;
          lineItems?: LineItem[];
          discountCents?: number;
          discountCodeId?: number | null;
          feeCents?: number;
        };
      };
      const d = resumeJson.data;
      if (
        d?.id == null ||
        !Number.isFinite(Number(d.id)) ||
        !Array.isArray(d.lineItems) ||
        d.lineItems.length === 0
      ) {
        return NextResponse.json(
          { error: "Invalid resume response from shop backend." },
          { status: 500 }
        );
      }

      orderId = Number(d.id);
      orderNumber =
        typeof d.orderNumber === "string" && d.orderNumber.trim()
          ? d.orderNumber.trim()
          : `BW-${orderId}`;
      lineItems = d.lineItems;
      discountCentsFallback = Math.max(0, Math.floor(Number(d.discountCents) || 0));
      feeCentsFallback = Math.max(0, Math.floor(Number(d.feeCents) || 0));
      if (d.discountCodeId != null && Number(d.discountCodeId) > 0) {
        discountCodeId = Number(d.discountCodeId);
      }
      feeCents = feeCentsFallback;
    } else {
      if (!Array.isArray(rawLineItems) || rawLineItems.length === 0) {
        return NextResponse.json(
          { error: "Invalid checkout payload" },
          { status: 400 }
        );
      }
      lineItems = rawLineItems;
      if (bodyDiscountCodeId != null && bodyDiscountCodeId > 0) {
        discountCodeId = bodyDiscountCodeId;
      }

      const prepRes = await fetch(`${strapiBase}/api/orders/checkout-prepare`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${strapiJwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lineItems,
          ...(shippingAddressId != null ? { shippingAddressId } : {}),
          ...(discountCodeId != null ? { discountCodeId } : {}),
        }),
        cache: "no-store",
      });

      if (!prepRes.ok) {
        let message = "Could not start checkout.";
        try {
          const errBody = (await prepRes.json()) as {
            error?: { message?: string };
            message?: string;
          };
          message =
            errBody?.error?.message || errBody?.message || message;
        } catch {
          const text = await prepRes.text().catch(() => "");
          if (text) message = text.slice(0, 200);
        }
        return NextResponse.json(
          { error: message },
          {
            status:
              prepRes.status >= 400 && prepRes.status < 600
                ? prepRes.status
                : 400,
          }
        );
      }

      const prepJson = (await prepRes.json()) as {
        data?: { id?: number; orderNumber?: string; feeCents?: number; totalCents?: number };
      };
      const preparedId = prepJson.data?.id;
      const preparedOrderNumber = prepJson.data?.orderNumber;
      feeCents = Math.max(0, Math.floor(Number(prepJson.data?.feeCents) || 0));
      if (preparedId == null || !Number.isFinite(Number(preparedId))) {
        return NextResponse.json(
          { error: "Invalid response from shop backend." },
          { status: 500 }
        );
      }
      orderId = Number(preparedId);
      orderNumber =
        typeof preparedOrderNumber === "string" && preparedOrderNumber.trim()
          ? preparedOrderNumber.trim()
          : `BW-${orderId}`;
    }

    const subtotalCents = lineItems.reduce(
      (s, item) => s + Math.round(item.unitPrice * item.quantity),
      0
    );

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2026-03-25.dahlia",
    });

    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    let metaDiscountId = "";

    if (discountCodeId != null && discountCodeId > 0) {
      const applied = await stripeCouponsFromDiscountCode(
        stripe,
        discountCodeId,
        subtotalCents
      );
      if (applied.ok) {
        discounts = applied.discounts;
        metaDiscountId = applied.metaDiscountId;
      } else if (resumeOrderId == null) {
        return NextResponse.json({ error: applied.message }, { status: 400 });
      }
    }

    if (!discounts?.length && discountCentsFallback > 0) {
      const amountOff = Math.min(subtotalCents, discountCentsFallback);
      if (amountOff > 0) {
        const coupon = await stripe.coupons.create({
          amount_off: amountOff,
          currency: "usd",
          duration: "once",
          name: `Order discount (resume)`,
        });
        discounts = [{ coupon: coupon.id }];
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: `${orderId}`,
      customer_email: customerEmail?.trim() || sessionUser.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: `${orderId}`,
        orderNumber,
        discountCodeId: metaDiscountId,
      },
      line_items: [
        ...lineItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: toStripeAmount(item.unitPrice),
          product_data: {
            name: item.title,
            metadata: {
              variantId: `${item.variantId}`,
            },
          },
        },
        })),
        ...(feeCents > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: "usd",
                  unit_amount: toStripeAmount(feeCents),
                  product_data: {
                    name: "Packaging & shipping",
                    metadata: {
                      kind: "fees",
                      orderId: `${orderId}`,
                    },
                  },
                },
              } satisfies Stripe.Checkout.SessionCreateParams.LineItem,
            ]
          : []),
      ],
      ...(discounts?.length ? { discounts } : {}),
    });

    return NextResponse.json({
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Checkout failed",
      },
      { status: 500 }
    );
  }
}
