import type { OrderShippingAddressSummary } from "lib/order-shipping-address";
import { formatOrderShippingAddressLines } from "lib/order-shipping-address";

export function OrderShippingAddressDetailSection({
  address,
  heading = "Shipping address",
}: {
  address: OrderShippingAddressSummary | null;
  heading?: string;
}) {
  const lines = address ? formatOrderShippingAddressLines(address) : [];
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{heading}</p>
      {!address ? (
        <p className="mt-2 text-zinc-500">No shipping address recorded for this order.</p>
      ) : lines.length === 0 ? (
        <p className="mt-2 text-zinc-500">
          A shipping address is linked to this order, but details were not returned.
        </p>
      ) : (
        <div className="mt-2 space-y-0.5 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-3 text-zinc-800">
          {lines.map((line, i) => (
            <p key={i} className="text-sm leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
