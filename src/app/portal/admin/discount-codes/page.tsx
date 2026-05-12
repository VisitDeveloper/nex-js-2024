import AdminDiscountCodeClient from "components/specific_elements/portal/admin-discount-code-client";

export default function AdminDiscountCodesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Discount codes</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Codes apply at Stripe Checkout. Amounts use the same minor unit as cart line items (e.g. USD
          cents). Customers enter a code on the cart page before paying.
        </p>
      </header>
      <AdminDiscountCodeClient />
    </div>
  );
}
