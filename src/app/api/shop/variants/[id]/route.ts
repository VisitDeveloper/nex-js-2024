import { NextRequest, NextResponse } from "next/server";
import { strapiServerBaseUrl } from "lib/strapi-server-fetch";
import { inventoryAttributesFromVariant } from "lib/shop-inventory";
import { parseMoney } from "lib/variant-pricing";

function variantAvailable(attrs: Record<string, unknown> | undefined): number {
  const a = inventoryAttributesFromVariant(attrs);
  if (!a) return 0;
  const n = a.available ?? a.onHand;
  return Math.max(0, Number(n) || 0);
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "Invalid variant id" }, { status: 400 });
  }

  const base = strapiServerBaseUrl().replace(/\/$/, "");
  const qs = new URLSearchParams();
  qs.set("populate[inventory]", "true");
  qs.set("populate[product]", "true");
  qs.set("locale", "en");

  try {
    const res = await fetch(`${base}/api/product-variants/${id}?${qs.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: "Variant not found" }, { status: 404 });
    }
    const payload = (await res.json()) as {
      data?: {
        id?: number;
        attributes?: Record<string, unknown>;
      };
    };
    const row = payload.data;
    if (!row || typeof row.id !== "number" || !row.attributes) {
      return NextResponse.json({ ok: false, error: "Variant not found" }, { status: 404 });
    }

    const attrs = row.attributes;
    const available = variantAvailable(attrs);
    const variantTitle = (attrs.title as string) || "Variant";
    const priceMajor = parseMoney(attrs.price);
    const unitPrice = Math.round(priceMajor * 100);

    const prod = attrs.product as
      | { data?: { attributes?: { title?: string } } }
      | undefined;
    const productTitle = prod?.data?.attributes?.title?.trim() || "";
    const title = productTitle ? `${productTitle} — ${variantTitle}` : variantTitle;

    return NextResponse.json({
      ok: true,
      variantId: row.id,
      title,
      unitPrice,
      available,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Lookup failed" }, { status: 502 });
  }
}
