import { z } from "zod";
import { getStrapiOrigin } from "lib/strapi-origin";

export const addressWriteSchema = z.object({
  label: z.string().max(120).optional(),
  receiverName: z.string().min(1).max(200),
  phone: z.string().min(1).max(50),
  province: z.string().min(1).max(120),
  city: z.string().min(1).max(120),
  postalCode: z.string().min(1).max(32),
  addressLine1: z.string().min(1).max(500),
  addressLine2: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
});

export type AddressBookRow = {
  id: number;
  label: string;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
  isDefault: boolean;
};

export function normalizeStrapiAddress(entry: {
  id?: number;
  attributes?: Record<string, unknown>;
} | null | undefined): AddressBookRow | null {
  if (entry == null || entry.id == null) return null;
  const a = entry.attributes || {};
  return {
    id: Number(entry.id),
    label: typeof a.label === "string" && a.label.trim() ? a.label.trim() : "Home",
    receiverName: String(a.receiverName ?? ""),
    phone: String(a.phone ?? ""),
    province: String(a.province ?? ""),
    city: String(a.city ?? ""),
    postalCode: String(a.postalCode ?? ""),
    addressLine1: String(a.addressLine1 ?? ""),
    addressLine2: typeof a.addressLine2 === "string" ? a.addressLine2 : "",
    isDefault: Boolean(a.isDefault),
  };
}

export function strapiAddressPayloadFromBody(body: z.infer<typeof addressWriteSchema>): Record<string, unknown> {
  return {
    label: body.label?.trim() || "Home",
    receiverName: body.receiverName.trim(),
    phone: body.phone.trim(),
    province: body.province.trim(),
    city: body.city.trim(),
    postalCode: body.postalCode.trim(),
    addressLine1: body.addressLine1.trim(),
    addressLine2: body.addressLine2?.trim() ? body.addressLine2.trim() : null,
    isDefault: Boolean(body.isDefault),
  };
}

/** After setting one address as default, clear `isDefault` on the customer's other addresses. */
export async function unsetOtherDefaultAddresses(
  strapiJwt: string,
  exceptId: number,
  baseUrl?: string
): Promise<void> {
  const base = (baseUrl || getStrapiOrigin())?.replace(/\/$/, "");
  if (!base) return;

  const res = await fetch(`${base}/api/addresses?pagination[pageSize]=50`, {
    headers: { Authorization: `Bearer ${strapiJwt}` },
    cache: "no-store",
  });
  if (!res.ok) return;

  const payload = (await res.json().catch(() => ({}))) as {
    data?: { id?: number; attributes?: { isDefault?: boolean } }[];
  };
  const rows = payload?.data || [];

  for (const row of rows) {
    const id = Number(row.id);
    if (!Number.isFinite(id) || id === exceptId) continue;
    if (!row.attributes?.isDefault) continue;
    await fetch(`${base}/api/addresses/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${strapiJwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: { isDefault: false } }),
      cache: "no-store",
    });
  }
}
