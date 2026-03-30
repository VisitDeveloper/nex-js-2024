import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { COOKIE_NAME, STRAPI_JWT_COOKIE } from "config/constant";
import {
  canAccessPortalAdmin,
  normalizeRoleKey,
} from "lib/portal-roles";
import { getStrapiOrigin } from "lib/strapi-origin";

export class AdminAuthError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "AdminAuthError";
  }
}

type AppJwtPayload = {
  userId?: number;
  email?: string;
  role?: string;
};

export function strapiBaseUrl(): string {
  return getStrapiOrigin();
}

/**
 * Portal cookie (OutSideJWT) + Strapi JWT must both be present after login/register.
 */
export async function requirePortalStrapiSession(): Promise<{
  role: string;
  strapiJwt: string;
}> {
  const jar = cookies();
  const appToken = jar.get(COOKIE_NAME)?.value;
  const strapiJwt = jar.get(STRAPI_JWT_COOKIE)?.value;
  if (!appToken || !strapiJwt) {
    throw new AdminAuthError(
      "Session incomplete. Sign out and sign in again to refresh Strapi access.",
      401
    );
  }
  const secret = process.env.JWT_SECRET || "";
  if (!secret) {
    throw new AdminAuthError("Server misconfiguration", 500);
  }
  let payload: AppJwtPayload;
  try {
    payload = verify(appToken, secret) as AppJwtPayload;
  } catch {
    throw new AdminAuthError("Invalid or expired session", 401);
  }
  const role = normalizeRoleKey(payload.role);
  if (!canAccessPortalAdmin(role)) {
    throw new AdminAuthError("Forbidden", 403);
  }
  return { role, strapiJwt };
}

/**
 * Header required by Strapi routes that use `auth: false` + `staff-or-checkout-webhook`
 * (order transition, order shipment patch). Must match `BRAINWAVE_CHECKOUT_WEBHOOK_SECRET` in Strapi .env.
 */
export function strapiCheckoutWebhookHeaders(): Record<string, string> {
  const wh = process.env.BRAINWAVE_CHECKOUT_WEBHOOK_SECRET?.trim();
  return wh ? { "x-brainwave-checkout-secret": wh } : {};
}

export async function strapiAdminFetch(
  path: string,
  strapiJwt: string,
  init: RequestInit = {}
): Promise<Response> {
  const base = strapiBaseUrl();
  if (!base) {
    throw new AdminAuthError("Strapi URL is not configured", 500);
  }
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${strapiJwt}`,
      ...(init.headers as Record<string, string>),
    },
    cache: "no-store",
  });
}

/** For server components: forward staff Strapi JWT when present. */
export async function adminStrapiAuthHeaders(): Promise<HeadersInit> {
  const strapiJwt = cookies().get(STRAPI_JWT_COOKIE)?.value;
  const headers: Record<string, string> = {};
  if (strapiJwt) {
    headers.Authorization = `Bearer ${strapiJwt}`;
  }
  return headers;
}

/** Session JWT first; falls back to `STRAPI_API_TOKEN` for server-only admin fetches. */
export async function adminStrapiFetchHeaders(): Promise<HeadersInit> {
  const fromSession = await adminStrapiAuthHeaders();
  const merged: Record<string, string> = { ...(fromSession as Record<string, string>) };
  const token = process.env.STRAPI_API_TOKEN?.trim();
  if (!merged.Authorization && token) {
    merged.Authorization = `Bearer ${token}`;
  }
  return merged;
}
