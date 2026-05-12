import { fetchAdminShopOpsMetrics } from "lib/shop-ops-metrics";
import type { ShopOpsMetrics } from "lib/strapi-server-fetch";
import { cn } from "lib/utils";

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

const CARDS: {
  key: keyof ShopOpsMetrics;
  label: string;
  hint: string;
  format: (v: number) => string;
}[] = [
  { key: "totalOrders", label: "Total orders", hint: "All records in sample", format: (v) => v.toLocaleString("en-US") },
  { key: "totalRevenue", label: "Revenue (sum)", hint: "Sum of totalAmount fields", format: (v) => formatUsd(v) },
  { key: "paidOrders", label: "Paid & delivered", hint: "Successful payment lifecycle", format: (v) => v.toLocaleString("en-US") },
  { key: "processingOrders", label: "Processing & shipped", hint: "Fulfillment in progress", format: (v) => v.toLocaleString("en-US") },
  { key: "aov", label: "AOV", hint: "Revenue ÷ order count", format: (v) => formatUsd(v) },
  {
    key: "conversionRate",
    label: "Paid rate",
    hint: "% of orders paid or delivered",
    format: (v) => `${v.toFixed(1)}%`,
  },
];

export default async function AdminAnalyticsPage() {
  const { metrics, error } = await fetchAdminShopOpsMetrics();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-black">Store analytics</h1>
        <p className="text-sm text-[#333333]/80 max-w-2xl leading-relaxed">
          Aggregates from Strapi orders (up to 200 most recent in this view). Sign in as staff so
          metrics match the Orders workspace.
        </p>
      </header>

      {error || !metrics ? (
        <div
          className={cn(
            "rounded-2xl border px-5 py-4 text-sm shadow-sm",
            "border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50/80 text-amber-950"
          )}
        >
          <p className="font-semibold">Could not load metrics</p>
          <p className="mt-1 text-amber-900/85">
            {error?.trim() || "Unknown error — check Strapi URL, token, and staff session."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS.map(({ key, label, hint, format }) => {
            const raw = metrics[key];
            const num = typeof raw === "number" ? raw : Number(raw) || 0;
            return (
              <div
                key={key}
                className="rounded-2xl border border-[#E8DDD0]/85 bg-white/85 p-5 shadow-sm backdrop-blur-md ring-1 ring-black/[0.02]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#333333]/50">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-black tracking-tight">
                  {format(num)}
                </p>
                <p className="mt-1 text-xs text-[#333333]/65">{hint}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
