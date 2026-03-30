import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, STRAPI_JWT_COOKIE } from "config/constant";
import { verifyAppJwt } from "lib/auth-session";
import { getStrapiOrigin } from "lib/strapi-origin";
import {
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
  return { strapiJwt: strapiJwt.trim() };
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid address id" }, { status: 400 });
  }

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

  const res = await fetch(`${base}/api/addresses/${id}`, {
    method: "PUT",
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
      (payload as { error?: { message?: string } })?.error?.message || "Could not update address";
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  if (data.isDefault) {
    await unsetOtherDefaultAddresses(ctx.strapiJwt, id, base);
  }

  const row = normalizeStrapiAddress(
    (payload as { data?: { id?: number; attributes?: Record<string, unknown> } }).data
  );
  return NextResponse.json({ address: row });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid address id" }, { status: 400 });
  }

  const ctx = customerStrapiSession();
  if (!ctx) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const base = getStrapiOrigin()?.replace(/\/$/, "");
  if (!base) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 503 });
  }

  const res = await fetch(`${base}/api/addresses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${ctx.strapiJwt}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const msg =
      (payload as { error?: { message?: string } })?.error?.message || "Could not delete address";
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
