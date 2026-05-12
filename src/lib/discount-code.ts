export type DiscountCodeAttrs = {
  code?: string;
  discountType?: "percent" | "fixed";
  amount?: unknown;
  isActive?: boolean;
  minSubtotal?: unknown;
  maxRedemptions?: number | null;
  redemptionCount?: unknown;
  startsAt?: string | null;
  endsAt?: string | null;
};

function num(v: unknown): number {
  if (v == null || v === "") return 0;
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function normalizeDiscountCodeInput(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

/** Subtotal and all money values in the same minor unit as cart (e.g. USD cents). */
export function validateDiscountAgainstSubtotal(
  attrs: DiscountCodeAttrs | null | undefined,
  subtotalCents: number
): { ok: true; discountCents: number; discountType: "percent" | "fixed" } | { ok: false; message: string } {
  if (!attrs) {
    return { ok: false, message: "This discount code is not valid." };
  }
  if (!attrs.isActive) {
    return { ok: false, message: "This code is inactive." };
  }

  const now = new Date();
  if (attrs.startsAt && new Date(attrs.startsAt) > now) {
    return { ok: false, message: "This code is not active yet." };
  }
  if (attrs.endsAt && new Date(attrs.endsAt) < now) {
    return { ok: false, message: "This code has expired." };
  }

  const maxR = attrs.maxRedemptions;
  const used = Math.max(0, Math.floor(num(attrs.redemptionCount)));
  if (maxR != null && maxR > 0 && used >= maxR) {
    return { ok: false, message: "This code has reached its usage limit." };
  }

  const minSub = Math.max(0, Math.floor(num(attrs.minSubtotal)));
  if (subtotalCents < minSub) {
    return {
      ok: false,
      message: `Minimum cart subtotal for this code is ${minSub.toLocaleString("en-US")}.`,
    };
  }

  const kind = attrs.discountType === "fixed" ? "fixed" : "percent";
  const amount = num(attrs.amount);

  if (kind === "percent") {
    const p = Math.min(100, Math.max(0, amount));
    if (p <= 0) {
      return { ok: false, message: "This discount code is not valid." };
    }
    const discountCents = Math.min(subtotalCents, Math.floor((subtotalCents * p) / 100));
    return { ok: true, discountCents, discountType: "percent" };
  }

  const fixed = Math.max(0, Math.floor(amount));
  if (fixed <= 0) {
    return { ok: false, message: "This discount code is not valid." };
  }
  const discountCents = Math.min(subtotalCents, fixed);
  return { ok: true, discountCents, discountType: "fixed" };
}
