"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  SHOP_CART_STORAGE_KEY,
  type ShopCartDiscount,
  type ShopCartItem,
  cartSubtotalCents,
  formatUsdFromCents,
  loadShopCart,
  mergeShopCartItem,
  saveShopCart,
} from "lib/shop-cart";

export function CartBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ShopCartItem[]>([]);
  const [discount, setDiscount] = useState<ShopCartDiscount | null>(null);
  const [feeCents, setFeeCents] = useState(0);
  const [codeInput, setCodeInput] = useState("");
  const [discountMsg, setDiscountMsg] = useState("");
  const [discountBusy, setDiscountBusy] = useState(false);
  const [addFromUrlBusy, setAddFromUrlBusy] = useState(false);
  const [addFromUrlError, setAddFromUrlError] = useState("");

  useEffect(() => {
    const { items: it, discount: d } = loadShopCart();
    setItems(it);
    setDiscount(d);
  }, []);

  const variantFromUrl = searchParams.get("variant");

  useEffect(() => {
    if (!variantFromUrl) return;
    const id = Number(variantFromUrl);
    if (!Number.isFinite(id) || id <= 0) {
      router.replace("/shop/cart");
      return;
    }

    let cancelled = false;
    setAddFromUrlBusy(true);
    setAddFromUrlError("");

    (async () => {
      try {
        const res = await fetch(`/api/shop/variants/${id}`);
        const data = (await res.json()) as {
          ok?: boolean;
          variantId?: number;
          title?: string;
          unitPrice?: number;
          available?: number;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !data.ok || data.variantId == null || !data.title || data.unitPrice == null) {
          setAddFromUrlError(data.error || "Could not add this item.");
          router.replace("/shop/cart");
          return;
        }
        if ((data.available ?? 0) <= 0) {
          setAddFromUrlError("This option is out of stock.");
          router.replace("/shop/cart");
          return;
        }
        const { items: currentItems, discount: disc } = loadShopCart();
        const newItem: ShopCartItem = {
          variantId: data.variantId,
          title: data.title,
          quantity: 1,
          unitPrice: data.unitPrice,
        };
        const merged = mergeShopCartItem(currentItems, newItem);
        saveShopCart(merged, disc);
        setItems(merged);
        setDiscount(disc);
        router.replace("/shop/cart");
      } catch {
        if (!cancelled) {
          setAddFromUrlError("Could not add this item.");
          router.replace("/shop/cart");
        }
      } finally {
        if (!cancelled) setAddFromUrlBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [variantFromUrl, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    saveShopCart(items, discount);
  }, [items, discount]);

  const subtotalCents = useMemo(() => cartSubtotalCents(items), [items]);
  const discountCents = discount?.discountCents ?? 0;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (items.length === 0) {
          if (!cancelled) setFeeCents(0);
          return;
        }
        const res = await fetch("/api/shop/cart-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lineItems: items.map((it) => ({
              variantId: it.variantId,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
            })),
            discountCents,
          }),
          cache: "no-store",
        });
        const json = (await res.json().catch(() => ({}))) as { ok?: boolean; feeCents?: number };
        if (!cancelled && res.ok && json.ok) {
          setFeeCents(Math.max(0, Math.floor(Number(json.feeCents) || 0)));
        }
      } catch {
        // Ignore fee calc failures; checkout will compute final amount.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [items, discountCents]);

  const totalCents = Math.max(0, subtotalCents - discountCents + feeCents);

  async function applyCode() {
    setDiscountBusy(true);
    setDiscountMsg("");
    try {
      const res = await fetch("/api/shop/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeInput, subtotalCents }),
      });
      const json = (await res.json()) as {
        valid?: boolean;
        message?: string;
        discountCodeId?: number;
        code?: string;
        discountCents?: number;
        discountType?: string;
      };
      if (!json.valid) {
        setDiscountMsg(json.message || "Invalid code.");
        return;
      }
      if (
        json.discountCodeId == null ||
        json.discountCents == null ||
        !json.code ||
        !json.discountType
      ) {
        setDiscountMsg("Unexpected server response.");
        return;
      }
      setDiscount({
        discountCodeId: json.discountCodeId,
        code: json.code,
        discountCents: json.discountCents,
        discountType: json.discountType === "fixed" ? "fixed" : "percent",
      });
      setCodeInput("");
      setDiscountMsg("Code applied.");
    } catch {
      setDiscountMsg("Could not validate code.");
    } finally {
      setDiscountBusy(false);
    }
  }

  function removeDiscount() {
    setDiscount(null);
    setDiscountMsg("");
  }

  return (
    <main className="mx-auto max-w-screen-xl space-y-6 px-5 py-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Cart</h1>
        <p className="text-sm text-zinc-600">Review your items and apply discounts before checkout.</p>
      </div>
      {addFromUrlBusy ? (
        <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
          Adding to cart...
        </p>
      ) : null}
      {addFromUrlError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {addFromUrlError}
        </p>
      ) : null}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/70 p-6 text-sm text-zinc-700">
          <p>Your cart is empty.</p>
          <Link href="/shop" className="mt-3 inline-flex font-semibold text-emerald-700 hover:underline">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-900">
              Items ({items.length})
            </div>
            <div className="divide-y divide-zinc-100">
              {items.map((item) => (
                <div
                  key={`${item.variantId}-${item.title}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-zinc-800">{item.title}</span>
                  <span className="text-zinc-700">
                    {item.quantity} × {formatUsdFromCents(item.unitPrice)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
            <p className="text-sm font-semibold text-zinc-900">Discount code</p>
            <div className="flex flex-wrap gap-2">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Enter code"
                className="min-w-[12rem] flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="button"
                disabled={discountBusy || !codeInput.trim()}
                onClick={() => void applyCode()}
                className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50"
              >
                {discountBusy ? "Applying..." : "Apply"}
              </button>
            </div>
            {discount ? (
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-emerald-800">
                  Active: <strong>{discount.code}</strong> (−{formatUsdFromCents(discount.discountCents)})
                </span>
                <button
                  type="button"
                  onClick={removeDiscount}
                  className="text-xs font-semibold text-red-700 underline"
                >
                  Remove code
                </button>
              </div>
            ) : null}
            {discountMsg ? <p className="text-xs text-zinc-600">{discountMsg}</p> : null}
          </div>

          <div className="max-w-md space-y-1 rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm">
            <div className="flex justify-between text-zinc-700">
              <span>Subtotal</span>
              <span>{formatUsdFromCents(subtotalCents)}</span>
            </div>
            {discount ? (
              <div className="flex justify-between font-medium text-red-700">
                <span>Discount</span>
                <span>−{formatUsdFromCents(discount.discountCents)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-zinc-700">
              <span>Packaging &amp; shipping</span>
              <span>{formatUsdFromCents(feeCents)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900">
              <span>Total</span>
              <span>{formatUsdFromCents(totalCents)}</span>
            </div>
          </div>

          <Link
            href="/shop/checkout"
            className="inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Continue to checkout
          </Link>
        </div>
      )}
      <p className="text-xs text-zinc-400">
        Cart data is stored in your browser ({SHOP_CART_STORAGE_KEY}).
      </p>
    </main>
  );
}
