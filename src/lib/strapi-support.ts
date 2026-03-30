import { randomUUID } from "crypto";
import { strapiAdminFetch } from "lib/admin-strapi";
import { getStrapiOrigin } from "lib/strapi-origin";

export type SupportMessageAuthor = "customer" | "support";

export type SupportMessageDTO = {
  id: string;
  author: SupportMessageAuthor;
  body: string;
  authorLabel?: string;
  createdAt: string;
};

export type SupportConversationDTO = {
  id: string;
  strapiUserId: number;
  userEmail: string;
  subject: string | null;
  status: "open" | "closed";
  lastActivityAt: string;
  messages: SupportMessageDTO[];
};

const STRAPI_PATH = "/api/support-conversations";

export class StrapiSupportError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "StrapiSupportError";
  }
}

/**
 * Customer support must use the user's Strapi JWT when present so POST/PUT work.
 * If we preferred `STRAPI_API_TOKEN` first, a common read-only storefront token would
 * make Strapi return 403 on create/update.
 */
function resolveSupportBearer(strapiJwt: string | null | undefined): string {
  const j = strapiJwt?.trim();
  if (j) return `Bearer ${j}`;
  const api = process.env.STRAPI_API_TOKEN?.trim();
  if (api) return `Bearer ${api}`;
  throw new StrapiSupportError(
    "Sign in again so your session includes Strapi access, or set STRAPI_API_TOKEN (full access) on the server.",
    401
  );
}

function strapiSupportBaseUrl(): string {
  const base = getStrapiOrigin()?.replace(/\/$/, "");
  if (!base) throw new StrapiSupportError("Strapi URL is not configured", 500);
  return base;
}

function extractStrapiErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "Strapi request failed";
  const p = payload as Record<string, unknown>;
  const err = p.error;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string" && e.message) return e.message;
    const details = e.details;
    if (details && typeof details === "object") {
      const d = details as { errors?: { message?: string; path?: string[] }[] };
      if (Array.isArray(d.errors) && d.errors.length) {
        const parts = d.errors
          .map((x) => (typeof x.message === "string" ? x.message : ""))
          .filter(Boolean);
        if (parts.length) return parts.join("; ");
      }
    }
  }
  return "Strapi request failed";
}

async function strapiSupportAuthorizedFetch(
  path: string,
  strapiJwt: string | null | undefined,
  init: RequestInit & { jsonBody?: Record<string, unknown> } = {}
): Promise<unknown> {
  const base = strapiSupportBaseUrl();
  const auth = resolveSupportBearer(strapiJwt);
  const { jsonBody, ...rest } = init;
  const res = await fetch(`${base}${path}`, {
    ...rest,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      ...(rest.headers as Record<string, string>),
    },
    body: jsonBody != null ? JSON.stringify(jsonBody) : rest.body,
    cache: "no-store",
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new StrapiSupportError(extractStrapiErrorMessage(payload), res.status);
  }
  return payload;
}

function iso(d: unknown): string {
  if (typeof d === "string") return d;
  if (d instanceof Date) return d.toISOString();
  return new Date().toISOString();
}

function normalizeMessages(raw: unknown): SupportMessageDTO[] {
  if (!Array.isArray(raw)) return [];
  const out: SupportMessageDTO[] = [];
  raw.forEach((m, i) => {
    if (!m || typeof m !== "object") return;
    const o = m as Record<string, unknown>;
    const id = typeof o.id === "string" && o.id ? o.id : `msg-${i}`;
    const author: SupportMessageAuthor = o.author === "support" ? "support" : "customer";
    const body = typeof o.body === "string" ? o.body : "";
    const authorLabel = typeof o.authorLabel === "string" ? o.authorLabel : undefined;
    const createdAt = iso(o.createdAt);
    out.push({ id, author, body, authorLabel, createdAt });
  });
  return out;
}

function messageToStrapiJson(m: SupportMessageDTO): Record<string, unknown> {
  const o: Record<string, unknown> = {
    id: m.id,
    author: m.author,
    body: m.body,
    createdAt: m.createdAt,
  };
  if (m.authorLabel) o.authorLabel = m.authorLabel;
  return o;
}

/** Strapi 4.10 Content API uses PUT for updates (PATCH returns 405 on core routes). */
function conversationToStrapiPutData(c: SupportConversationDTO): Record<string, unknown> {
  return {
    strapiUserId: c.strapiUserId,
    userEmail: c.userEmail,
    subject: c.subject,
    status: c.status,
    lastActivityAt: c.lastActivityAt,
    messages: c.messages.map(messageToStrapiJson),
  };
}

export function conversationFromStrapi(entry: {
  id: number;
  attributes?: Record<string, unknown>;
}): SupportConversationDTO {
  const a = entry.attributes || {};
  const messages = normalizeMessages(a.messages);
  const status = a.status === "closed" ? "closed" : "open";
  return {
    id: String(entry.id),
    strapiUserId: Number(a.strapiUserId),
    userEmail: String(a.userEmail ?? ""),
    subject: a.subject == null || a.subject === "" ? null : String(a.subject),
    status,
    lastActivityAt: iso(a.lastActivityAt),
    messages,
  };
}

type StrapiListPayload = { data?: { id: number; attributes?: Record<string, unknown> }[] };
type StrapiOnePayload = { data?: { id: number; attributes?: Record<string, unknown> } | null };

/** Customer flows: Strapi API token and/or the user's Strapi JWT (see resolveSupportBearer). */
export async function strapiSupportTokenListForUser(
  strapiUserId: number,
  strapiJwt: string | null | undefined
): Promise<SupportConversationDTO[]> {
  const q = new URLSearchParams();
  q.set("filters[strapiUserId][$eq]", String(strapiUserId));
  q.set("sort", "lastActivityAt:desc");
  q.set("pagination[limit]", "100");
  const payload = (await strapiSupportAuthorizedFetch(`${STRAPI_PATH}?${q}`, strapiJwt)) as StrapiListPayload;
  const rows = payload.data || [];
  return rows.map(conversationFromStrapi);
}

export async function strapiSupportTokenGetById(
  id: string,
  strapiJwt: string | null | undefined
): Promise<SupportConversationDTO | null> {
  try {
    const payload = (await strapiSupportAuthorizedFetch(`${STRAPI_PATH}/${id}`, strapiJwt)) as StrapiOnePayload;
    const d = payload.data;
    if (!d) return null;
    return conversationFromStrapi(d);
  } catch (e) {
    if (e instanceof StrapiSupportError && e.status === 404) return null;
    throw e;
  }
}

export async function strapiSupportTokenCreate(
  input: {
    strapiUserId: number;
    userEmail: string;
    subject?: string;
    initialMessage: string;
  },
  strapiJwt: string | null | undefined
): Promise<SupportConversationDTO> {
  const now = new Date().toISOString();
  const msg = {
    id: randomUUID(),
    author: "customer" as const,
    body: input.initialMessage,
    createdAt: now,
  };
  const data: Record<string, unknown> = {
    strapiUserId: input.strapiUserId,
    userEmail: input.userEmail,
    status: "open",
    lastActivityAt: now,
    messages: [msg],
  };
  const sub = input.subject?.trim();
  if (sub) data.subject = sub;

  const payload = (await strapiSupportAuthorizedFetch(
    STRAPI_PATH,
    strapiJwt,
    {
      method: "POST",
      jsonBody: { data },
    }
  )) as StrapiOnePayload;
  const d = payload.data;
  if (!d) throw new StrapiSupportError("Strapi did not return conversation", 502);
  return conversationFromStrapi(d);
}

export async function strapiSupportTokenAppendCustomerMessage(
  id: string,
  body: string,
  strapiUserId: number,
  strapiJwt: string | null | undefined
): Promise<SupportConversationDTO | null> {
  const existing = await strapiSupportTokenGetById(id, strapiJwt);
  if (!existing || existing.strapiUserId !== strapiUserId) return null;
  const now = new Date().toISOString();
  const nextMessages = [
    ...existing.messages,
    { id: randomUUID(), author: "customer" as const, body, createdAt: now },
  ];
  let status: "open" | "closed" = existing.status;
  if (status === "closed") status = "open";
  const updated: SupportConversationDTO = {
    ...existing,
    messages: nextMessages,
    lastActivityAt: now,
    status,
  };
  const payload = (await strapiSupportAuthorizedFetch(`${STRAPI_PATH}/${id}`, strapiJwt, {
    method: "PUT",
    jsonBody: { data: conversationToStrapiPutData(updated) },
  })) as StrapiOnePayload;
  const d = payload.data;
  if (!d) return null;
  return conversationFromStrapi(d);
}

/** Staff: Strapi users-permissions JWT (portal session). */
export async function strapiSupportStaffList(strapiJwt: string): Promise<SupportConversationDTO[]> {
  const q = new URLSearchParams();
  q.set("sort", "lastActivityAt:desc");
  q.set("pagination[limit]", "200");
  const res = await strapiAdminFetch(`${STRAPI_PATH}?${q}`, strapiJwt);
  const payload = (await res.json().catch(() => ({}))) as StrapiListPayload;
  if (!res.ok) {
    throw new StrapiSupportError(extractStrapiErrorMessage(payload), res.status);
  }
  const rows = payload.data || [];
  return rows.map(conversationFromStrapi);
}

export async function strapiSupportStaffGetById(
  strapiJwt: string,
  id: string
): Promise<SupportConversationDTO | null> {
  const res = await strapiAdminFetch(`${STRAPI_PATH}/${id}`, strapiJwt);
  const payload = (await res.json().catch(() => ({}))) as StrapiOnePayload;
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new StrapiSupportError(extractStrapiErrorMessage(payload), res.status);
  }
  const d = payload.data;
  if (!d) return null;
  return conversationFromStrapi(d);
}

export async function strapiSupportStaffSetStatus(
  strapiJwt: string,
  id: string,
  status: "open" | "closed"
): Promise<SupportConversationDTO | null> {
  const existing = await strapiSupportStaffGetById(strapiJwt, id);
  if (!existing) return null;
  const updated: SupportConversationDTO = { ...existing, status };
  const res = await strapiAdminFetch(`${STRAPI_PATH}/${id}`, strapiJwt, {
    method: "PUT",
    body: JSON.stringify({ data: conversationToStrapiPutData(updated) }),
  });
  const payload = (await res.json().catch(() => ({}))) as StrapiOnePayload;
  if (!res.ok) {
    throw new StrapiSupportError(extractStrapiErrorMessage(payload), res.status);
  }
  const d = payload.data;
  if (!d) return null;
  return conversationFromStrapi(d);
}

export async function strapiSupportStaffAppendMessage(
  strapiJwt: string,
  id: string,
  body: string,
  authorLabel: string
): Promise<SupportConversationDTO | null> {
  const existing = await strapiSupportStaffGetById(strapiJwt, id);
  if (!existing) return null;
  const now = new Date().toISOString();
  const nextMessages = [
    ...existing.messages,
    {
      id: randomUUID(),
      author: "support" as const,
      body,
      authorLabel,
      createdAt: now,
    },
  ];
  let status: "open" | "closed" = existing.status;
  if (status === "closed") status = "open";
  const updated: SupportConversationDTO = {
    ...existing,
    messages: nextMessages,
    lastActivityAt: now,
    status,
  };
  const res = await strapiAdminFetch(`${STRAPI_PATH}/${id}`, strapiJwt, {
    method: "PUT",
    body: JSON.stringify({ data: conversationToStrapiPutData(updated) }),
  });
  const payload = (await res.json().catch(() => ({}))) as StrapiOnePayload;
  if (!res.ok) {
    throw new StrapiSupportError(extractStrapiErrorMessage(payload), res.status);
  }
  const d = payload.data;
  if (!d) return null;
  return conversationFromStrapi(d);
}
