import { getStrapiOrigin } from "lib/strapi-origin";

const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  cache?: RequestCache;
};

export async function strapiRequest(path: string, options: RequestOptions = {}) {
  const strapiUrl = getStrapiOrigin();
  if (!strapiUrl) {
    throw new Error("STRAPI_API_URL is not configured");
  }

  const response = await fetch(`${strapiUrl.replace(/\/$/, "")}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    cache: options.cache || "no-store",
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Strapi request failed");
  }

  return payload;
}

/** Stripe webhook → Strapi: same secret as Strapi BRAINWAVE_CHECKOUT_WEBHOOK_SECRET (policy staff-or-checkout-webhook). */
export function strapiWebhookHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (STRAPI_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  }
  const wh = process.env.BRAINWAVE_CHECKOUT_WEBHOOK_SECRET?.trim();
  if (wh) {
    headers["x-brainwave-checkout-secret"] = wh;
  }
  return headers;
}

export async function strapiWebhookRequest(path: string, options: RequestOptions = {}) {
  const strapiUrl = getStrapiOrigin();
  if (!strapiUrl) {
    throw new Error("STRAPI_API_URL is not configured");
  }

  const response = await fetch(`${strapiUrl.replace(/\/$/, "")}${path}`, {
    method: options.method || "GET",
    headers: strapiWebhookHeaders(),
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    cache: options.cache || "no-store",
  });

  const text = await response.text();
  let payload: { error?: { message?: string }; message?: string } = {};
  if (text) {
    try {
      payload = JSON.parse(text) as typeof payload;
    } catch {
      if (!response.ok) {
        throw new Error(
          `Strapi ${response.status}: ${text.slice(0, 200) || response.statusText}`
        );
      }
    }
  }
  if (!response.ok) {
    const msg =
      payload?.error?.message ||
      (typeof payload?.message === "string" ? payload.message : null) ||
      `Strapi request failed (${response.status})`;
    throw new Error(msg);
  }

  return payload;
}

export function toStripeAmount(amount: number): number {
  return Math.round(amount);
}
