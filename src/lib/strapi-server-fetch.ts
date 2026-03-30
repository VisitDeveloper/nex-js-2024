/**
 * Server-side Strapi / internal API fetch helpers so pages still render when the backend is down.
 */

import { getStrapiOrigin } from "lib/strapi-origin";

export function strapiServerBaseUrl(): string {
  return getStrapiOrigin();
}

function friendlyFetchFailure(err: unknown): string {
  if (!(err instanceof Error)) return "Could not reach the content server.";
  const m = err.message || "";
  if (/fetch failed|ECONNREFUSED|ENOTFOUND|network|Failed to fetch/i.test(m)) {
    return "Content server is unreachable. Start Strapi (or check STRAPI_API_URL) and try again.";
  }
  return m;
}

async function strapiErrorMessageFromResponse(res: Response): Promise<string> {
  const fallback = `Content server error (${res.status})`;
  try {
    const text = await res.text();
    if (!text?.trim()) return fallback;
    try {
      const j = JSON.parse(text) as {
        error?: unknown;
        message?: string;
      };
      if (typeof j.message === "string" && j.message.trim()) return j.message;
      const e = j.error;
      if (typeof e === "string" && e.trim()) return e;
      if (
        e &&
        typeof e === "object" &&
        "message" in e &&
        typeof (e as { message: string }).message === "string"
      ) {
        return (e as { message: string }).message;
      }
    } catch {
      const t = text.trim();
      if (t.length > 0 && t.length < 280) return t;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

export type StrapiListResult = { data: any[]; error: string | null };

/** Like `fetchStrapiCollection` but surfaces upstream / network failures for UI messaging. */
export async function fetchStrapiCollectionWithError(
  url: string,
  init?: RequestInit
): Promise<StrapiListResult> {
  if (!url?.trim()) {
    return { data: [], error: "Content API URL is not configured." };
  }
  try {
    const response = await fetch(url, { cache: "no-store", ...init });
    if (!response.ok) {
      return { data: [], error: await strapiErrorMessageFromResponse(response) };
    }
    const payload = await response.json().catch(() => ({}));
    return { data: payload?.data || [], error: null };
  } catch (e) {
    return { data: [], error: friendlyFetchFailure(e) };
  }
}

export type StrapiFirstResult = { item: any | null; error: string | null };

export async function fetchStrapiFirstWithError(
  url: string,
  init?: RequestInit
): Promise<StrapiFirstResult> {
  if (!url?.trim()) {
    return { item: null, error: "Content API URL is not configured." };
  }
  try {
    const response = await fetch(url, { cache: "no-store", ...init });
    if (!response.ok) {
      return { item: null, error: await strapiErrorMessageFromResponse(response) };
    }
    const payload = await response.json().catch(() => ({}));
    return { item: payload?.data?.[0] ?? null, error: null };
  } catch (e) {
    return { item: null, error: friendlyFetchFailure(e) };
  }
}

export type ShopOpsMetrics = {
  totalOrders: number;
  totalRevenue: number;
  paidOrders: number;
  processingOrders: number;
  aov?: number;
  conversionRate?: number;
};

export async function fetchStrapiCollection(
  url: string,
  init?: RequestInit
): Promise<any[]> {
  const { data } = await fetchStrapiCollectionWithError(url, init);
  return data;
}

export async function fetchStrapiFirst(
  url: string,
  init?: RequestInit
): Promise<any | null> {
  const { item } = await fetchStrapiFirstWithError(url, init);
  return item;
}

export async function fetchStrapiJson<T>(
  url: string,
  init: RequestInit | undefined,
  fallback: T
): Promise<T> {
  try {
    const response = await fetch(url, { cache: "no-store", ...init });
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchInternalJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: "no-store", ...init });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
