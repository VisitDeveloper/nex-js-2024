import { Suspense } from "react";
import { CartBody } from "./cart-body";

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <main className="max-w-screen-xl mx-auto px-5 py-12">
          <h1 className="text-3xl font-bold">Cart</h1>
          <p className="text-sm text-gray-600 mt-4">Loading…</p>
        </main>
      }
    >
      <CartBody />
    </Suspense>
  );
}
