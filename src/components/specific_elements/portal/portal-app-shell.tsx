"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  ExternalLink,
  FileText,
  FolderTree,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  ShoppingCart,
  Store,
  TicketPercent,
  Users,
} from "lucide-react";
import { cn } from "lib/utils";
import LogoutConfirmDialog from "components/portal/logout-confirm-dialog";

export type PortalNavItem = { href: string; label: string; icon: LucideIcon };

export type PortalShellConfig = {
  navGroups: { title: string; items: PortalNavItem[] }[];
  /** Exact path for dashboard home (used for active state). */
  rootNavHref: string;
  brandHomeHref: string;
  brandSubtitle: string;
  logoutRedirect: string;
  headerFallbackTitle: string;
  sessionFallbackLine: string;
};

export const ADMIN_PORTAL_SHELL_CONFIG: PortalShellConfig = {
  navGroups: [
    {
      title: "Overview",
      items: [
        {
          href: "/portal/admin",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Shop",
      items: [
        { href: "/portal/admin/products", label: "Products & inventory", icon: Package },
        { href: "/portal/admin/categories", label: "Categories", icon: FolderTree },
        { href: "/portal/admin/discount-codes", label: "Discount codes", icon: TicketPercent },
        { href: "/portal/admin/orders", label: "Orders", icon: ShoppingCart },
        { href: "/portal/admin/users", label: "Users", icon: Users },
        { href: "/portal/admin/support", label: "Support inbox", icon: MessageCircle },
      ],
    },
    {
      title: "Content & insight",
      items: [
        { href: "/portal/admin/blog", label: "Blog", icon: FileText },
        { href: "/portal/admin/analytics", label: "Analytics", icon: BarChart3 },
      ],
    },
  ],
  rootNavHref: "/portal/admin",
  brandHomeHref: "/portal/admin",
  brandSubtitle: "Admin & operations",
  logoutRedirect: "/auth/admin",
  headerFallbackTitle: "Admin",
  sessionFallbackLine: "BrainWave Academy · control center",
};

export const CUSTOMER_PORTAL_SHELL_CONFIG: PortalShellConfig = {
  navGroups: [
    {
      title: "Overview",
      items: [{ href: "/account", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      title: "Your account",
      items: [
        { href: "/account/orders", label: "Orders", icon: ShoppingCart },
        { href: "/account/tutorials", label: "My tutorials", icon: BookOpen },
        { href: "/account/addresses", label: "Addresses", icon: MapPin },
        { href: "/account/support", label: "Support", icon: MessageCircle },
        { href: "/shop", label: "Continue shopping", icon: Store },
      ],
    },
  ],
  rootNavHref: "/account",
  brandHomeHref: "/account",
  brandSubtitle: "Orders, learning & profile",
  logoutRedirect: "/auth",
  headerFallbackTitle: "Account",
  sessionFallbackLine: "BrainWave Academy · your account",
};

type MeUser = {
  email: string;
  displayName: string;
  role: string;
};

const sidebarSignOutBtnClass =
  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-medium text-[#333333]/80 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50";

function navActive(pathname: string, href: string, rootNavHref: string) {
  if (href === rootNavHref) {
    return pathname === rootNavHref || pathname === `${rootNavHref}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PortalAppShell({
  children,
  config,
}: {
  children: ReactNode;
  config: PortalShellConfig;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<MeUser | null>(null);

  const { navGroups, rootNavHref, brandHomeHref, brandSubtitle, logoutRedirect, headerFallbackTitle, sessionFallbackLine } =
    config;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = (await res.json()) as {
          user?: { email?: string; displayName?: string; role?: string } | null;
        };
        if (cancelled || !data?.user?.email) return;
        const u = data.user;
        setSessionUser({
          email: u.email ?? "",
          displayName: (u.displayName?.trim() || u.email) ?? "",
          role: u.role?.trim() || "user",
        });
      } catch {
        if (!cancelled) setSessionUser(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function confirmLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      setLogoutDialogOpen(false);
      router.push(logoutRedirect);
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const flatNav = navGroups.flatMap((g) => g.items);
  const currentTitle =
    pathname === rootNavHref || pathname === `${rootNavHref}/`
      ? "Dashboard"
      : flatNav.find((i) => navActive(pathname, i.href, rootNavHref))?.label ?? headerFallbackTitle;

  return (
    <div className="min-h-svh flex w-full antialiased text-[#333333]">
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={(o) => {
          if (!loggingOut) setLogoutDialogOpen(o);
        }}
        onConfirm={confirmLogout}
        busy={loggingOut}
      />
      <aside className="hidden sm:flex h-svh min-h-0 w-[17.5rem] shrink-0 flex-col overflow-hidden sticky top-0 self-start">
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#FEF6EC] via-[#FBF8F4] to-[#EDFEFC]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_0%_0%,rgba(29,193,182,0.14),transparent_55%),radial-gradient(ellipse_90%_60%_at_100%_100%,rgba(254,164,57,0.10),transparent_50%)]"
          aria-hidden
        />

        <div className="relative flex h-full min-h-0 flex-col border-r border-[#E8DDD0]/95 bg-white/20 shadow-[4px_0_24px_-12px_rgba(29,193,182,0.15)]">
          <div className="p-6 pb-5">
            <Link href={brandHomeHref} className="flex items-start gap-3 group">
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-1 ring-[#E8DDD0]/90 shadow-md shadow-[#1DC1B6]/10">
                <Image
                  src="/logo.png"
                  width={48}
                  height={48}
                  alt="BrainWave Academy"
                  className="object-contain p-1.5"
                  sizes="48px"
                  priority
                />
              </span>
              <span className="min-w-0 pt-0.5">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#1DC1B6]">
                  Console
                </span>
                <span className="mt-0.5 block text-[17px] font-bold tracking-tight text-black leading-snug group-hover:text-[#0f766e] transition-colors">
                  BrainWave Academy
                </span>
                <span className="mt-1 block text-xs font-medium text-[#333333]/75 leading-tight">{brandSubtitle}</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-6 min-h-0">
            {navGroups.map((group) => (
              <div key={group.title}>
                <p className="px-3 mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#333333]/85">
                  {group.title}
                </p>
                <ul className="space-y-1">
                  {group.items.map(({ href, label, icon: Icon }) => {
                    const active = navActive(pathname, href, rootNavHref);
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          className={cn(
                            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200",
                            active
                              ? "bg-white text-[#0f766e] shadow-sm ring-1 ring-[#1DC1B6]/35"
                              : "text-[#333333] hover:bg-white/75 hover:text-black"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                              active
                                ? "bg-[#1DC1B6] text-white shadow-sm shadow-[#1DC1B6]/25"
                                : "bg-[#EDFEFC]/90 text-[#1DC1B6] ring-1 ring-[#1DC1B6]/15 group-hover:bg-[#1DC1B6]/10"
                            )}
                          >
                            <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                          </span>
                          <span className="truncate">{label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="relative shrink-0 p-3 pt-3 space-y-1 border-t border-[#E8DDD0]/90 bg-white/30">
            <button
              type="button"
              onClick={() => setLogoutDialogOpen(true)}
              disabled={loggingOut}
              className={sidebarSignOutBtnClass}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FEF6EC] ring-1 ring-[#E8DDD0]/80">
                <LogOut className="h-3.5 w-3.5 text-[#333333]/70" aria-hidden />
              </span>
              Sign out
            </button>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium text-[#333333]/75 hover:text-[#1DC1B6] hover:bg-white/70 transition-colors"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FEF6EC] ring-1 ring-[#E8DDD0]/80">
                <ExternalLink className="h-3.5 w-3.5 text-[#333333]/70" aria-hidden />
              </span>
              Exit to public site
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#FEF6EC] to-[#EDFEFC]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_55%_at_50%_-15%,rgba(29,193,182,0.12),transparent_52%),radial-gradient(ellipse_65%_45%_at_100%_0%,rgba(254,164,57,0.08),transparent_48%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[linear-gradient(rgba(51,51,51,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(51,51,51,0.04)_1px,transparent_1px)] bg-[size:48px_48px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 h-6 z-[1] bg-[url('/pattern-wave.png')] bg-repeat-x bg-left opacity-90"
          aria-hidden
        />

        <header className="relative z-10 h-[3.25rem] sm:h-14 shrink-0 flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-8 border-b border-[#E8DDD0]/90 bg-white/55 backdrop-blur-xl supports-[backdrop-filter]:bg-white/45">
          <nav className="sm:hidden flex flex-1 min-w-0 gap-1 overflow-x-auto pb-0.5 -mb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {flatNav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                  navActive(pathname, href, rootNavHref)
                    ? "bg-[#1DC1B6] text-white shadow-md shadow-[#1DC1B6]/25"
                    : "text-[#333333] bg-white/80 border border-[#E8DDD0]/80"
                )}
              >
                {label.split(" ")[0]}
              </Link>
            ))}
          </nav>
          {sessionUser ? (
            <div
              className="sm:hidden flex min-w-0 max-w-[40%] flex-col items-end justify-center text-right leading-tight"
              title={`${sessionUser.displayName} · ${sessionUser.email} · ${sessionUser.role}`}
            >
              <span className="truncate text-[11px] font-semibold text-black">
                {sessionUser.displayName}
              </span>
              <span className="truncate text-[10px] text-[#333333]/70">{sessionUser.role}</span>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setLogoutDialogOpen(true)}
            disabled={loggingOut}
            className="sm:hidden shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E8DDD0]/90 bg-white text-[#333333] shadow-sm hover:bg-[#FFFBF7] disabled:opacity-50"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </button>
          <div className="hidden sm:flex items-center gap-3 min-w-0 flex-1">
            <div className="h-7 w-px bg-[#E8DDD0]/90 hidden md:block shrink-0" aria-hidden />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-black truncate leading-tight">{currentTitle}</p>
              <p
                className="text-[11px] text-[#333333]/65 truncate mt-0.5"
                title={sessionUser ? sessionUser.email : undefined}
              >
                {sessionUser ? (
                  <>
                    <span className="text-[#333333]">{sessionUser.displayName}</span>
                    <span className="text-[#333333]/40"> · </span>
                    <span className="font-medium text-[#1DC1B6]">{sessionUser.role}</span>
                  </>
                ) : (
                  sessionFallbackLine
                )}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-2 rounded-full border border-[#E8DDD0]/90 bg-white/85 px-3 py-1.5 text-[11px] font-medium text-[#333333]/80 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1DC1B6] opacity-45" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1DC1B6]" />
              </span>
              Secure session
            </span>
            <button
              type="button"
              onClick={() => setLogoutDialogOpen(true)}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#FEA439]/35 bg-[#FEA439]/12 px-3 py-1.5 text-[11px] font-semibold text-[#B86B0A] shadow-sm hover:bg-[#FEA439]/22 hover:text-[#8A4F08] disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Sign out
            </button>
          </div>
        </header>

        <main className="relative z-10 flex-1 overflow-auto p-4 sm:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
