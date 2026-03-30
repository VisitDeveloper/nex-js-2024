import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, STRAPI_JWT_COOKIE } from "config/constant";
import { verifyAppJwt } from "lib/auth-session";
import { getStrapiOrigin } from "lib/strapi-origin";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { orderId?: unknown };
    const orderId = Number(body.orderId);
    if (!Number.isFinite(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 });
    }

    const jar = cookies();
    const appJwt = jar.get(COOKIE_NAME)?.value;
    const strapiJwt = jar.get(STRAPI_JWT_COOKIE)?.value?.trim();
    const sessionUser = appJwt ? verifyAppJwt(appJwt) : null;
    if (!sessionUser || !strapiJwt) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const strapiBase = getStrapiOrigin()?.replace(/\/$/, "");
    if (!strapiBase) {
      return NextResponse.json(
        { error: "Shop backend is not configured." },
        { status: 503 }
      );
    }

    const res = await fetch(
      `${strapiBase}/api/orders/${orderId}/abandon-payment`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${strapiJwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note: "Customer closed unpaid order from account",
        }),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      let message = "Could not update order.";
      try {
        const errBody = (await res.json()) as {
          error?: { message?: string };
          message?: string;
        };
        message = errBody?.error?.message || errBody?.message || message;
      } catch {
        const text = await res.text().catch(() => "");
        if (text) message = text.slice(0, 200);
      }
      return NextResponse.json(
        { error: message },
        { status: res.status >= 400 && res.status < 600 ? res.status : 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Request failed" },
      { status: 500 }
    );
  }
}
