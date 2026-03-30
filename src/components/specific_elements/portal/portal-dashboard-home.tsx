"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  BarChart3,
  FileText,
  FolderTree,
  MessageCircle,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { cn } from "lib/utils";

export type PortalMetrics = {
  totalOrders: number;
  totalRevenue: number;
  paidOrders: number;
  processingOrders: number;
  aov?: number;
  conversionRate?: number;
} | null;

const MODULES: {
  href: string;
  title: string;
  description: string;
  icon: typeof Package;
  accent: string;
  iconBg: string;
}[] = [
    {
      href: "/portal/admin/products",
      title: "Products & inventory",
      description: "SKUs, variants, and availability in one place.",
      icon: Package,
      accent: "from-[#1DC1B6]/18 to-[#EDFEFC]",
      iconBg: "from-[#1DC1B6] to-[#0d9488]",
    },
    {
      href: "/portal/admin/categories",
      title: "Categories",
      description: "Taxonomy for the blog and the product catalog.",
      icon: FolderTree,
      accent: "from-[#FEA439]/15 to-[#FEF6EC]",
      iconBg: "from-[#FEA439] to-[#ea8c1c]",
    },
    {
      href: "/portal/admin/orders",
      title: "Orders & fulfillment",
      description: "Payments, packing, and delivery status.",
      icon: ShoppingCart,
      accent: "from-[#2dd4bf]/14 to-[#EDFEFC]",
      iconBg: "from-[#14b8a6] to-[#0d9488]",
    },
    {
      href: "/portal/admin/users",
      title: "Customers",
      description: "People, roles, and access across teams.",
      icon: Users,
      accent: "from-[#1DC1B6]/12 to-[#e0f7f5]",
      iconBg: "from-[#0f766e] to-[#1DC1B6]",
    },
    {
      href: "/portal/admin/blog",
      title: "Blog publishing",
      description: "Drafts, schedules, and live site content.",
      icon: FileText,
      accent: "from-[#FEA439]/12 to-[#fff7ed]",
      iconBg: "from-[#f59e0b] to-[#FEA439]",
    },
    {
      href: "/portal/admin/support",
      title: "Support inbox",
      description: "Customer questions and team replies in one place.",
      icon: MessageCircle,
      accent: "from-[#5eead4]/14 to-[#EDFEFC]",
      iconBg: "from-[#1DC1B6] to-[#06b6d4]",
    },
    {
      href: "/portal/admin/analytics",
      title: "Analytics",
      description: "Signals that inform your next move.",
      icon: BarChart3,
      accent: "from-[#1DC1B6]/10 to-[#FEA439]/10",
      iconBg: "from-[#0f766e] to-[#c2410c]",
    },
  ];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function MiniBars({ className }: { className?: string }) {
  const pct = [38, 62, 44, 78, 52, 88, 58, 72, 48, 95, 66, 82];
  const barH = 52;
  return (
    <div
      className={className}
      role="img"
      aria-label="Decorative activity visualization"
    >
      <div className="flex items-end gap-1" style={{ height: barH }}>
        {pct.map((h, i) => (
          <div
            key={i}
            className="flex-1 max-w-[5px] rounded-full bg-[#1DC1B6]/45"
            style={{
              height: `${(h / 100) * barH}px`,
              opacity: 0.35 + (i % 4) * 0.12,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function PortalDashboardHome({
  metrics,
  metricsError,
}: {
  metrics: PortalMetrics;
  metricsError?: string | null;
}) {
  const revenue = metrics
    ? formatUsd(Number(metrics.totalRevenue) || 0)
    : "—";
  const secondary = metrics
    ? [
      {
        label: "Total orders",
        value: (metrics.totalOrders ?? 0).toLocaleString("en-US"),
        sub: "All-time",
      },
      {
        label: "Paid",
        value: (metrics.paidOrders ?? 0).toLocaleString("en-US"),
        sub: "Captured",
      },
      {
        label: "Processing",
        value: (metrics.processingOrders ?? 0).toLocaleString("en-US"),
        sub: "In queue",
      },
      {
        label: "AOV",
        value: formatUsd(
          typeof metrics.aov === "number"
            ? metrics.aov
            : Number(metrics.aov) || 0
        ),
        sub: "Per order",
      },
    ]
    : [];

  return (
    <div className="max-w-7xl mx-auto space-y-10 lg:space-y-12">
      <motion.header
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6"
      >
        <div className="space-y-3 max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#E8DDD0]/90 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#333333]/60 backdrop-blur-sm shadow-sm">
            <span className="h-1 w-1 rounded-full bg-[#1DC1B6] shadow-[0_0_8px_rgba(29,193,182,0.75)]" />
            Today
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black leading-[1.1]">
            A sharp,{" "}
            <span className="bg-gradient-to-r from-[#1DC1B6] via-[#0d9488] to-[#0891b2] bg-clip-text text-transparent">
              live snapshot
            </span>{" "}
            of your store
          </h1>
          <p className="text-[15px] text-[#333333] leading-relaxed">
            Clear KPIs, direct navigation, and every workspace one click away.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <span className="rounded-2xl border border-[#E8DDD0]/85 bg-white/85 px-4 py-3 text-sm text-[#333333] shadow-sm backdrop-blur-sm">
            <span className="font-semibold text-black">Metrics</span>
            <span className="text-[#333333]/45"> · </span>
            Store API
          </span>
        </div>
      </motion.header>

      {metrics ? (
        <motion.section
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          aria-label="Key metrics"
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5"
        >
          <div className="lg:col-span-5 relative overflow-hidden rounded-3xl border border-[#E8DDD0]/85 bg-gradient-to-br from-white via-[#FFFBF7] to-[#EDFEFC]/90 p-6 sm:p-8 text-[#333333] shadow-[0_20px_44px_-18px_rgba(29,193,182,0.14)] ring-1 ring-[#1DC1B6]/15">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#1DC1B6]/18 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#FEA439]/14 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1DC1B6]">
                Gross revenue
              </p>
              <p className="mt-3 text-4xl sm:text-5xl font-bold tabular-nums tracking-tight text-black">
                {revenue}
              </p>
              <p className="mt-2 text-sm text-[#333333]/70">
                Recorded across all paid orders
              </p>
              <MiniBars className="mt-6 border-t border-[#E8DDD0]/70 pt-6" />
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 gap-4 lg:gap-5">
            {secondary.map((item, idx) => (
              <motion.div
                key={item.label}
                custom={idx + 2}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-2xl border border-[#E8DDD0]/80 bg-white/80 p-5 shadow-sm backdrop-blur-md ring-1 ring-black/[0.02] transition-shadow hover:shadow-md hover:ring-[#1DC1B6]/10"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#333333]/50">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-bold tabular-nums text-black tracking-tight">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-[#333333]/65">{item.sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      ) : (
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50/80 px-5 py-4 text-sm text-amber-950 shadow-sm"
        >
          <p className="font-semibold">Metrics unavailable</p>
          <p className="mt-1 text-amber-900/80">
            {metricsError?.trim()
              ? metricsError
              : "Check Strapi and your staff session, then refresh."}
          </p>
        </motion.div>
      )}

      <motion.section
        custom={6}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        aria-label="Admin modules"
        className="space-y-5"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-black">Workspaces</h2>
            <p className="mt-1 text-sm text-[#333333]/75">
              Jump into the tools you use every day
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
          {MODULES.map(({ href, title, description, icon: Icon, accent, iconBg }, i) => (
            <motion.div
              key={href}
              custom={7 + i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <Link href={href} className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1DC1B6]/35 focus-visible:ring-offset-2 rounded-3xl">
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={cn(
                    "relative h-full overflow-hidden rounded-3xl border border-[#E8DDD0]/85 bg-white/85 p-6 shadow-sm backdrop-blur-md",
                    "ring-1 ring-black/[0.02] transition-shadow duration-300",
                    "group-hover:border-[#1DC1B6]/35 group-hover:shadow-xl group-hover:shadow-[0_20px_40px_-16px_rgba(29,193,182,0.12)]"
                  )}
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br",
                      accent
                    )}
                    aria-hidden
                  />
                  <div className="relative flex flex-col h-full min-h-[11rem]">
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={cn(
                          "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
                          iconBg,
                          "shadow-black/20 ring-1 ring-white/25"
                        )}
                      >
                        <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8DDD0]/90 bg-white/95 text-[#333333]/40 transition-all group-hover:border-[#1DC1B6]/40 group-hover:text-[#1DC1B6]">
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </span>
                    </div>
                    <h3 className="mt-5 text-base font-bold text-black">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm text-[#333333] leading-relaxed flex-1">
                      {description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0f766e] group-hover:text-[#1DC1B6]">
                      Open
                      <span aria-hidden>→</span>
                    </span>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
