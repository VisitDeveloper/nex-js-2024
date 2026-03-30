"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  cartSubtotalCents,
  formatUsdFromCents,
  loadShopCart,
  type ShopCartItem,
  type ShopCartDiscount,
} from "lib/shop-cart";
import type { AddressBookRow } from "lib/account-address-book";

type CheckoutResponse = {
  id: string;
  url: string;
};

type AddressFormState = {
  label: string;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
};

const emptyAddressForm: AddressFormState = {
  label: "Home",
  receiverName: "",
  phone: "",
  province: "",
  city: "",
  postalCode: "",
  addressLine1: "",
  addressLine2: "",
};

const fieldClassName =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100";

export default function CheckoutPage() {
  const [items, setItems] = useState<ShopCartItem[]>([]);
  const [discount, setDiscount] = useState<ShopCartDiscount | null>(null);
  const [feeCents, setFeeCents] = useState(0);
  const [addresses, setAddresses] = useState<AddressBookRow[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const { items: it, discount: d } = loadShopCart();
    setItems(it);
    setDiscount(d);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/account/addresses", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) {
            setAddresses([]);
            setSelectedAddressId(null);
          }
          return;
        }
        const data = (await res.json()) as { addresses?: AddressBookRow[] };
        if (cancelled) return;
        const rows = data.addresses || [];
        setAddresses(rows);
        if (rows.length > 0) {
          const defaultAddress = rows.find((a) => a.isDefault);
          setSelectedAddressId(defaultAddress?.id ?? rows[0].id);
        } else {
          setSelectedAddressId(null);
        }
      } finally {
        if (!cancelled) {
          setAddressesLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
        // Ignore; checkout session creation will compute final amount.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [items, discountCents]);

  const onCreateAddress = async () => {
    setSavingAddress(true);
    setError("");
    try {
      const body = {
        label: addressForm.label.trim() || "Home",
        receiverName: addressForm.receiverName.trim(),
        phone: addressForm.phone.trim(),
        province: addressForm.province.trim(),
        city: addressForm.city.trim(),
        postalCode: addressForm.postalCode.trim(),
        addressLine1: addressForm.addressLine1.trim(),
        addressLine2: addressForm.addressLine2.trim() || undefined,
        isDefault: true,
      };
      const response = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        address?: AddressBookRow | null;
      };
      if (!response.ok || !payload.address) {
        throw new Error(payload.error || "Could not save address");
      }
      const created = payload.address;
      setAddresses((prev) => [created, ...prev.map((a) => ({ ...a, isDefault: false }))]);
      setSelectedAddressId(created.id);
      setAddressForm(emptyAddressForm);
      setShowNewAddressForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const onCheckout = async () => {
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (addressesLoading) {
      setError("Loading your saved addresses. Please try again.");
      return;
    }
    if (selectedAddressId == null || selectedAddressId <= 0) {
      setError("Please select a shipping address before checkout.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const lineItems = items.map((item) => ({
        variantId: item.variantId,
        title: item.title,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));

      const origin = window.location.origin;
      const body: Record<string, unknown> = {
        lineItems,
        successUrl: `${origin}/account/orders?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/shop/cart`,
        shippingAddressId: selectedAddressId,
      };

      if (discount?.discountCodeId != null) {
        body.discountCodeId = discount.discountCodeId;
      }

      const response = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as CheckoutResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to create checkout session");
      }

      window.location.href = payload.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-screen-xl space-y-6 px-5 py-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Checkout</h1>
        <p className="text-sm text-zinc-600">Choose shipping address and complete payment securely.</p>
      </div>
      {items.length === 0 ? (
        <p className="text-gray-600">
          Your cart is empty.{" "}
          <Link href="/shop/cart" className="text-[#19C1B6] underline">
            Back to cart
          </Link>
        </p>
      ) : (
        <>
          <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white text-sm shadow-sm">
            {items.map((item) => (
              <li
                key={`${item.variantId}-${item.title}`}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <span className="font-medium text-zinc-800">{item.title}</span>
                <span className="text-zinc-700">
                  {item.quantity} × {formatUsdFromCents(item.unitPrice)}
                </span>
              </li>
            ))}
          </ul>
          <div className="max-w-md space-y-1 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 text-sm">
            <div className="flex justify-between text-zinc-700">
              <span>Subtotal</span>
              <span>{formatUsdFromCents(subtotalCents)}</span>
            </div>
            {discount ? (
              <div className="flex justify-between font-medium text-red-700">
                <span>Discount ({discount.code})</span>
                <span>−{formatUsdFromCents(discount.discountCents)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-zinc-700">
              <span>Packaging &amp; shipping</span>
              <span>{formatUsdFromCents(feeCents)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold text-zinc-900">
              <span>Total due</span>
              <span>
                {formatUsdFromCents(Math.max(0, subtotalCents - discountCents + feeCents))}
              </span>
            </div>
          </div>
          <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-zinc-900">Shipping address</h2>
              {!addressesLoading && addresses.length > 0 ? (
                <Link
                  href="/account/addresses"
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  Manage address book
                </Link>
              ) : null}
            </div>
            {addressesLoading ? <p className="text-sm text-zinc-600">Loading addresses…</p> : null}
            {!addressesLoading && addresses.length > 0 ? (
              <div className="space-y-3">
                <div className="grid gap-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                        selectedAddressId === address.id
                          ? "border-emerald-300 bg-emerald-50/60 shadow-sm"
                          : "border-zinc-200 bg-white hover:border-zinc-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingAddress"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mt-1 accent-emerald-600"
                      />
                      <span className="text-sm text-zinc-700">
                        <span className="block font-semibold text-zinc-900">
                          {address.label || "Address"} - {address.receiverName}
                        </span>
                        <span className="mt-0.5 block">{address.phone}</span>
                        <span className="block">
                          {address.province}, {address.city}, {address.postalCode}
                        </span>
                        <span className="block">{address.addressLine1}</span>
                        {address.addressLine2 ? (
                          <span className="block">{address.addressLine2}</span>
                        ) : null}
                        {address.isDefault ? (
                          <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                            Default
                          </span>
                        ) : null}
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm((v) => !v)}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50"
                >
                  {showNewAddressForm ? "Cancel new address" : "Add a new address"}
                </button>
              </div>
            ) : null}
            {!addressesLoading && (addresses.length === 0 || showNewAddressForm) ? (
              <div className="space-y-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/60 p-4">
                <p className="text-sm text-zinc-700">
                  {addresses.length === 0
                    ? "You do not have a saved address yet. Add one now; it will be saved and selected for this order."
                    : "Add a new shipping address. After saving, it will be selected for this order."}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    className={fieldClassName}
                    placeholder="Label (Home, Work...)"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))}
                  />
                  <input
                    required
                    className={fieldClassName}
                    placeholder="Receiver name"
                    value={addressForm.receiverName}
                    onChange={(e) => setAddressForm((f) => ({ ...f, receiverName: e.target.value }))}
                  />
                  <input
                    required
                    className={fieldClassName}
                    placeholder="Phone"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                  <input
                    required
                    className={fieldClassName}
                    placeholder="Postal code"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm((f) => ({ ...f, postalCode: e.target.value }))}
                  />
                  <input
                    required
                    className={fieldClassName}
                    placeholder="Province / state"
                    value={addressForm.province}
                    onChange={(e) => setAddressForm((f) => ({ ...f, province: e.target.value }))}
                  />
                  <input
                    required
                    className={fieldClassName}
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                  />
                  <input
                    required
                    className={`${fieldClassName} sm:col-span-2`}
                    placeholder="Address line 1"
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm((f) => ({ ...f, addressLine1: e.target.value }))}
                  />
                  <input
                    className={`${fieldClassName} sm:col-span-2`}
                    placeholder="Address line 2 (optional)"
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm((f) => ({ ...f, addressLine2: e.target.value }))}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void onCreateAddress()}
                  disabled={
                    savingAddress ||
                    !addressForm.receiverName.trim() ||
                    !addressForm.phone.trim() ||
                    !addressForm.province.trim() ||
                    !addressForm.city.trim() ||
                    !addressForm.postalCode.trim() ||
                    !addressForm.addressLine1.trim()
                  }
                  className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
                >
                  {savingAddress ? "Saving address…" : "Save address and use it"}
                </button>
              </div>
            ) : null}
          </section>
          <p className="text-sm text-zinc-600">
            You must be signed in to pay. Your order is saved when you continue; after payment it appears below{" "}
            <strong>My orders</strong>.
          </p>
          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}
          <button
            onClick={() => void onCheckout()}
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Redirecting…" : "Complete purchase"}
          </button>
        </>
      )}
    </main>
  );
}
