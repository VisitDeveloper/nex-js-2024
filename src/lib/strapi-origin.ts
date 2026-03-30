/**
 * Strapi Content API lives at `{origin}/api/...`.
 * Env vars are often mistakenly set to `{origin}/api` — that would produce double `/api/api/...`
 * and break POST routes (405 / 404) for variant create, upload, etc.
 */
export function getStrapiOrigin(): string {
  const raw = (
    process.env.STRAPI_API_URL ||
    process.env.NEXT_PUBLIC_BASE_API_URL_SERVER ||
    ""
  ).trim();
  return normalizeStrapiOrigin(raw);
}

export function normalizeStrapiOrigin(raw: string): string {
  let u = raw.replace(/\/+$/, "");
  if (u.length >= 4 && u.toLowerCase().endsWith("/api")) {
    u = u.slice(0, -4).replace(/\/+$/, "");
  }
  return u;
}
