import { cn } from "lib/utils";
import { formatMoney, variantDiscountPercent } from "lib/variant-pricing";

export default function StorefrontPriceRow({
  price,
  compareAtPrice,
  currency,
  size = "md",
  className,
}: {
  price: number;
  compareAtPrice: number;
  currency: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const pct = variantDiscountPercent(price, compareAtPrice);
  const saleCls =
    size === "lg"
      ? "text-2xl font-bold text-red-700"
      : size === "sm"
        ? "text-xs font-bold text-red-700"
        : "text-sm font-bold text-red-700";
  const baseCls =
    size === "lg"
      ? "text-xl font-semibold text-gray-900"
      : size === "sm"
        ? "text-xs font-semibold text-gray-900"
        : "text-sm font-semibold text-gray-900";
  const strikeCls =
    size === "lg" ? "text-lg text-gray-400 line-through" : "text-sm text-gray-400 line-through";

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      {pct != null ? (
        <>
          <span className={strikeCls}>{formatMoney(compareAtPrice, currency)}</span>
          <span className={saleCls}>{formatMoney(price, currency)}</span>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
            {pct}% off
          </span>
        </>
      ) : (
        <span className={baseCls}>{formatMoney(price, currency)}</span>
      )}
    </div>
  );
}
