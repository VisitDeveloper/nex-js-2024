import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, STRAPI_JWT_COOKIE } from "config/constant";
import { sessionDisplayName, verifyAppJwt } from "lib/auth-session";
import { ensureCustomerProfileForUser } from "lib/ensure-customer-profile";
import { getStrapiOrigin } from "lib/strapi-origin";
import {
  type AddressBookRow,
  addressWriteSchema,
  normalizeStrapiAddress,
  strapiAddressPayloadFromBody,
  unsetOtherDefaultAddresses,
} from "lib/account-address-book";

function customerStrapiSession() {
  const jar = cookies();
  const app = jar.get(COOKIE_NAME)?.value;
  const strapiJwt = jar.get(STRAPI_JWT_COOKIE)?.value;
  const user = app ? verifyAppJwt(app) : null;
  if (!user || !strapiJwt?.trim()) return null;
  return { strapiJwt: strapiJwt.trim(), user };
}

export async function GET() {
  const ctx = customerStrapiSession();
  if (!ctx) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const base = getStrapiOrigin()?.replace(/\/$/, "");
  if (!base) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const res = await fetch(`${base}/api/addresses?pagination[pageSize]=50`, {
    headers: { Authorization: `Bearer ${ctx.strapiJwt}` },
    cache: "no-store",
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (payload as { error?: { message?: string } })?.error?.message || "Failed to load addresses";
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  const raw = (payload as { data?: unknown[] })?.data || [];
  const addresses: AddressBookRow[] = [];
  for (const e of raw) {
    const row = normalizeStrapiAddress(
      e as { id?: number; attributes?: Record<string, unknown> }
    );
    if (row) addresses.push(row);
  }

  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const ctx = customerStrapiSession();
  if (!ctx) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: ReturnType<typeof addressWriteSchema.parse>;
  try {
    body = addressWriteSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid address data" }, { status: 400 });
  }

  const base = getStrapiOrigin()?.replace(/\/$/, "");
  if (!base) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const data = strapiAddressPayloadFromBody(body);

  await ensureCustomerProfileForUser(
    ctx.strapiJwt,
    ctx.user.userId,
    sessionDisplayName(ctx.user)
  );

  const res = await fetch(`${base}/api/addresses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ctx.strapiJwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
    cache: "no-store",
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (payload as { error?: { message?: string } })?.error?.message || "Could not save address";
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  const createdId = Number((payload as { data?: { id?: number } })?.data?.id);
  if (Number.isFinite(createdId) && data.isDefault) {
    await unsetOtherDefaultAddresses(ctx.strapiJwt, createdId, base);
  }

  const row = normalizeStrapiAddress(
    (payload as { data?: { id?: number; attributes?: Record<string, unknown> } }).data
  );
  return NextResponse.json({ address: row }, { status: 201 });
}
