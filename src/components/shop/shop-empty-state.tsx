import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { cn } from "lib/utils";

type Props = {
  /** True when URL has search / type / age filters */
  hasActiveFilters: boolean;
};

/**
 * Enterprise-style empty catalog / no-results for the storefront.
 */
export default function ShopEmptyState({ hasActiveFilters }: Props) {
  return (
    <div
      className={cn(
        "relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-black/[0.07]",
        "bg-gradient-to-b from-white via-slate-50/90 to-[#FEF8EC]/60",
        "px-6 py-14 text-center shadow-[0_1px_0_rgba(0,0,0,0.04),0_24px_48px_-12px_rgba(15,23,42,0.08)]",
        "sm:px-10 sm:py-16"
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2319C1B6' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#19C1B6]/[0.09] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-[#FEA439]/[0.11] blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center gap-5">
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl",
            "border border-[#19C1B6]/20 bg-white shadow-sm",
            "ring-4 ring-[#19C1B6]/[0.06]"
          )}
        >
          <PackageSearch className="h-8 w-8 text-[#19C1B6]" strokeWidth={1.5} aria-hidden />
        </div>

        {hasActiveFilters ? (
          <>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                No products match this view
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                Adjust your search or filters—we couldn&apos;t find any catalog items that fit these
                criteria. Try broadening your selection or clearing filters to see the full store.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:justify-center">
              <Link
                href="/shop"
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold",
                  "bg-[#19C1B6] text-white shadow-sm transition hover:bg-[#16a89f]",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#19C1B6]"
                )}
              >
                Clear all filters
              </Link>
              <Link
                href="/"
                className={cn(
                  "inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700",
                  "transition hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                Back to home
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Catalog is empty
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                There are no published products in the store yet. When your team adds listings in
                the admin catalog, they will appear here automatically.
              </p>
            </div>
            <Link
              href="/"
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold",
                "border border-slate-200 bg-white text-slate-800",
                "transition hover:border-[#19C1B6]/40 hover:bg-[#19C1B6]/[0.04]"
              )}
            >
              Return home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
