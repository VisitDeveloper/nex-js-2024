/**
 * Best-effort message from Strapi REST error JSON (validation, etc.).
 */
export function strapiErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const err = p.error;
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string" && e.message.trim()) {
      const details = e.details as { errors?: Array<{ message?: string; path?: string[] }> } | undefined;
      const msgs = details?.errors
        ?.map((x) => (typeof x?.message === "string" ? x.message.trim() : ""))
        .filter(Boolean);
      if (msgs?.length) {
        const joined = msgs.join("; ");
        const top = e.message.trim();
        if (top && top !== joined && !top.includes("error occurred")) return `${top}: ${joined}`;
        return joined;
      }
      return e.message.trim();
    }
    const detailsOnly = e.details as { errors?: Array<{ message?: string; path?: string[] }> } | undefined;
    const first = detailsOnly?.errors?.find((x) => typeof x?.message === "string");
    if (first?.message) return first.message.trim();
  }
  if (typeof p.message === "string" && p.message.trim()) return p.message.trim();
  return null;
}
