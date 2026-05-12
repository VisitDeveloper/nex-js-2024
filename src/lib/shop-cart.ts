export const SHOP_CART_STORAGE_KEY = "brainwave-shop-cart";

export type ShopCartItem = {
  variantId: number;
  title: string;
  quantity: number;
  unitPrice: number;
};

export type ShopCartDiscount = {
  discountCodeId: number;
  code: string;
  discountCents: number;
  discountType: "percent" | "fixed";
};

export type ShopCartState = {
  items: ShopCartItem[];
  discount: ShopCartDiscount | null;
};

export function loadShopCart(): ShopCartState {
  if (typeof window === "undefined") {
    return { items: [], discount: null };
  }
  try {
    const raw = localStorage.getItem(SHOP_CART_STORAGE_KEY);
    if (!raw) return { items: [], discount: null };
    const p = JSON.parse(raw) as unknown;
    if (Array.isArray(p)) {
      return { items: p as ShopCartItem[], discount: null };
    }
    if (p && typeof p === "object" && "items" in p) {
      const o = p as { items?: ShopCartItem[]; discount?: ShopCartDiscount | null };
      const disc =
        o.discount &&
        typeof o.discount.discountCodeId === "number" &&
        typeof o.discount.discountCents === "number" &&
        typeof o.discount.code === "string"
          ? o.discount
          : null;
      return {
        items: Array.isArray(o.items) ? o.items : [],
        discount: disc,
      };
    }
    return { items: [], discount: null };
  } catch {
    return { items: [], discount: null };
  }
}

export function saveShopCart(items: ShopCartItem[], discount: ShopCartDiscount | null) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SHOP_CART_STORAGE_KEY, JSON.stringify({ items, discount }));
}

/** unitPrice is integer cents (same as Stripe unit_amount). */
export function mergeShopCartItem(items: ShopCartItem[], item: ShopCartItem): ShopCartItem[] {
  const idx = items.findIndex((i) => i.variantId === item.variantId);
  if (idx === -1) return [...items, item];
  const next = [...items];
  const row = next[idx]!;
  next[idx] = { ...row, quantity: row.quantity + item.quantity };
  return next;
}

export function cartSubtotalCents(items: ShopCartItem[]): number {
  return items.reduce((s, i) => s + Math.round(i.unitPrice * i.quantity), 0);
}

/** Display USD assuming amounts are integer cents. */
export function formatUsdFromCents(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}
