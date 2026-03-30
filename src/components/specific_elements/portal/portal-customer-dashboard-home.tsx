"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  BookOpen,
  MapPin,
  MessageCircle,
  ShoppingCart,
  Store,
} from "lucide-react";
import { cn } from "lib/utils";

const MODULES: {
  href: string;
  title: string;
  description: string;
  icon: typeof ShoppingCart;
  accent: string;
  iconBg: string;
}[] = [
  {
    href: "/account/orders",
    title: "Orders",
    description: "Track purchases, status, and receipts in one place.",
    icon: ShoppingCart,
    accent: "from-[#2dd4bf]/14 to-[#EDFEFC]",
    iconBg: "from-[#14b8a6] to-[#0d9488]",
  },
  {
    href: "/account/tutorials",
    title: "My tutorials",
    description: "Everything you’ve unlocked and can learn from next.",
    icon: BookOpen,
    accent: "from-[#FEA439]/15 to-[#FEF6EC]",
    iconBg: "from-[#FEA439] to-[#ea8c1c]",
  },
  {
    href: "/account/addresses",
    title: "Addresses",
    description: "Shipping and billing details for faster checkout.",
    icon: MapPin,
    accent: "from-[#1DC1B6]/12 to-[#e0f7f5]",
    iconBg: "from-[#0f766e] to-[#1DC1B6]",
  },
  {
    href: "/account/support",
    title: "Support",
    description: "Ask a question or follow up on existing conversations.",
    icon: MessageCircle,
    accent: "from-[#5eead4]/14 to-[#EDFEFC]",
    iconBg: "from-[#1DC1B6] to-[#06b6d4]",
  },
  {
    href: "/shop",
    title: "Continue shopping",
    description: "Browse the catalog and add new items to your library.",
    icon: Store,
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

export default function PortalCustomerDashboardHome() {
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
            Your space
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black leading-[1.1]">
            Welcome back —{" "}
            <span className="bg-gradient-to-r from-[#1DC1B6] via-[#0d9488] to-[#0891b2] bg-clip-text text-transparent">
              orders, learning, and help
            </span>{" "}
            in one console
          </h1>
          <p className="text-[15px] text-[#333333] leading-relaxed">
            Same layout as the team portal: quick navigation, clear cards, and a calm workspace.
          </p>
        </div>
      </motion.header>

      <motion.section
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        aria-label="Account areas"
        className="space-y-5"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-black">Shortcuts</h2>
            <p className="mt-1 text-sm text-[#333333]/75">Open what you need in one click</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
          {MODULES.map(({ href, title, description, icon: Icon, accent, iconBg }, i) => (
            <motion.div key={href} custom={2 + i} variants={fadeUp} initial="hidden" animate="show">
              <Link
                href={href}
                className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1DC1B6]/35 focus-visible:ring-offset-2 rounded-3xl"
              >
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
                    <h3 className="mt-5 text-base font-bold text-black">{title}</h3>
                    <p className="mt-2 text-sm text-[#333333] leading-relaxed flex-1">{description}</p>
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
