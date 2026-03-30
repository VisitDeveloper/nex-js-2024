import { NextRequest, NextResponse } from "next/server";
import { strapiServerBaseUrl } from "lib/strapi-server-fetch";
import { parseMoney } from "lib/variant-pricing";

type LineItem = {
  variantId: number;
  quantity: number;
  unitPrice: number; // cents
};

function toPositiveInt(v: unknown, fallback = 0): number {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    lineItems?: LineItem[];
    discountCents?: number;
  };

  if (!Array.isArray(body.lineItems) || body.lineItems.length === 0) {
    return NextResponse.json({ ok: false, error: "lineItems required" }, { status: 400 });
  }

  const items = body.lineItems
    .map((it) => ({
      variantId: toPositiveInt(it?.variantId, 0),
      quantity: Math.max(1, toPositiveInt(it?.quantity, 1)),
      unitPrice: Math.max(0, Math.round(Number(it?.unitPrice) || 0)),
    }))
    .filter((it) => it.variantId > 0);

  if (items.length === 0) {
    return NextResponse.json({ ok: false, error: "Invalid line items" }, { status: 400 });
  }

  const discountCents = Math.max(0, Math.floor(Number(body.discountCents) || 0));
  const subtotalCents = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);

  const base = strapiServerBaseUrl().replace(/\/$/, "");
  const qs = new URLSearchParams();
  qs.set("populate[product]", "true");
  qs.set("locale", "en");

  let feeCents = 0;
  for (const it of items) {
    try {
      const res = await fetch(`${base}/api/product-variants/${it.variantId}?${qs.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) continue;
      const payload = (await res.json()) as {
        data?: { attributes?: Record<string, unknown> };
      };
      const attrs = payload?.data?.attributes;
      const prod = attrs?.product as
        | { data?: { attributes?: { packagingPrice?: unknown; shippingPrice?: unknown } } }
        | undefined;
      const pa = prod?.data?.attributes;
      const packaging = Math.round(parseMoney(pa?.packagingPrice) * 100);
      const shipping = Math.round(parseMoney(pa?.shippingPrice) * 100);
      feeCents += Math.max(0, packaging + shipping) * it.quantity;
    } catch {
      // Ignore fee lookup failures; checkout server will still enforce final amount.
    }
  }

  const totalCents = Math.max(0, subtotalCents - discountCents + feeCents);

  return NextResponse.json({
    ok: true,
    subtotalCents,
    discountCents,
    feeCents,
    totalCents,
  });
}

