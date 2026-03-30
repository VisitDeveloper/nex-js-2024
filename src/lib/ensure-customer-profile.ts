import { getStrapiOrigin } from "lib/strapi-origin";

/**
 * Orders are scoped in Strapi by `customerProfile.user`. After login/register we ensure a profile
 * exists (customer may POST only for their own `user` id — see Strapi policy customer-profile-create).
 */
export async function ensureCustomerProfileForUser(
  strapiJwt: string | undefined,
  userId: number,
  displayName: string
): Promise<void> {
  const jwt = strapiJwt?.trim();
  const base = getStrapiOrigin();
  if (!jwt || !base || !Number.isFinite(userId) || userId <= 0) return;

  const origin = base.replace(/\/$/, "");
  const authHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
  };

  try {
    const qs = new URLSearchParams();
    qs.set("filters[user][id][$eq]", String(userId));
    qs.set("pagination[pageSize]", "1");
    const existingRes = await fetch(`${origin}/api/customer-profiles?${qs.toString()}`, {
      headers: authHeaders,
      cache: "no-store",
    });
    if (existingRes.ok) {
      const existingPayload = (await existingRes.json().catch(() => ({}))) as {
        data?: { id?: unknown }[];
      };
      if (Array.isArray(existingPayload?.data) && existingPayload.data.length > 0) return;
    }
    // If GET failed (e.g. permissions) or returned empty, still try create — Strapi may auto-ensure on address/order too.

    const name = displayName.trim() || "Customer";
    const createRes = await fetch(`${origin}/api/customer-profiles`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        data: {
          fullName: name,
          user: userId,
        },
      }),
      cache: "no-store",
    });
    if (!createRes.ok && createRes.status !== 400) {
      // 400 often = validation / duplicate; ignore. Other errors are logged in dev only.
      if (process.env.NODE_ENV === "development") {
        const errBody = await createRes.text().catch(() => "");
        console.warn("[ensureCustomerProfileForUser] POST customer-profiles failed:", createRes.status, errBody);
      }
    }
  } catch {
    /* non-fatal */
  }
}
