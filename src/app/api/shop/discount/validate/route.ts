import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { strapiRequest } from "lib/shop-api";
import {
  normalizeDiscountCodeInput,
  validateDiscountAgainstSubtotal,
  type DiscountCodeAttrs,
} from "lib/discount-code";

const bodySchema = z.object({
  code: z.string().min(1),
  subtotalCents: z.coerce.number().int().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = bodySchema.parse(json);
    const norm = normalizeDiscountCodeInput(body.code);
    if (!norm) {
      return NextResponse.json(
        { valid: false, message: "Please enter a code." },
        { status: 400 }
      );
    }

    let payload: { data?: { id?: number; attributes?: DiscountCodeAttrs }[] };
    try {
      payload = (await strapiRequest(
        `/api/discount-codes?filters[code][$eq]=${encodeURIComponent(norm)}&pagination[limit]=1`
      )) as typeof payload;
    } catch {
      return NextResponse.json({
        valid: false,
        message: "This discount code is not valid.",
      });
    }

    const row = payload.data?.[0];
    if (!row?.id || !row.attributes) {
      return NextResponse.json({
        valid: false,
        message: "This discount code is not valid.",
      });
    }

    const v = validateDiscountAgainstSubtotal(row.attributes, body.subtotalCents);
    if (!v.ok) {
      return NextResponse.json({ valid: false, message: v.message });
    }

    return NextResponse.json({
      valid: true,
      discountCodeId: row.id,
      code: row.attributes.code ?? norm,
      discountCents: v.discountCents,
      discountType: v.discountType,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ valid: false, message: "Invalid request." }, { status: 400 });
    }
    return NextResponse.json(
      { valid: false, message: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
