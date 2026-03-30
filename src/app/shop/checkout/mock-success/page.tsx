"use client";

import Link from "next/link";
import { useEffect } from "react";
import { saveShopCart } from "lib/shop-cart";

export default function MockCheckoutSuccessPage() {
  useEffect(() => {
    saveShopCart([], null);
  }, []);

  return (
    <main className="max-w-screen-xl mx-auto px-5 py-12 space-y-6">
      <h1 className="text-3xl font-bold">Thank you (demo)</h1>
      <p className="text-gray-700 max-w-lg">
        Checkout is running in mock mode — no payment was processed. Your cart has been cleared for this
        demo flow. If you were signed in, the order is saved to your account and product tutorials unlock
        the same as after a real payment.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/account/orders"
          className="inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-white font-medium hover:bg-emerald-800"
        >
          My orders
        </Link>
        <Link href="/shop" className="inline-flex rounded-lg border border-zinc-300 px-4 py-2 font-medium">
          Back to shop
        </Link>
      </div>
    </main>
  );
}
