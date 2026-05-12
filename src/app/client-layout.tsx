"use client";

import React from "react";
import { AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";

import { DynamicObjectLiterals, MainLayout } from "components";
import { ThemeProvider } from "provider/theme-provider";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Top-level segments that skip marketing header/footer (still use MainLayout wrapper).
  const routeWithoutMarketingChrome: Record<string, true> = {
    auth: true,
    admin: true,
  };

  const topLevelRoute = pathname.split("/").filter(Boolean)[0] || "";
  const isAppPortalChrome = pathname.startsWith("/portal") || pathname.startsWith("/account");
  const skipMarketingChrome =
    routeWithoutMarketingChrome[topLevelRoute] === true;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AnimatePresence mode="popLayout">
        {isAppPortalChrome ? (
          children
        ) : (
          <MainLayout className="">
            {!skipMarketingChrome && (
              <DynamicObjectLiterals type="HeaderLayout" />
            )}
            {children}
            {!skipMarketingChrome && (
              <DynamicObjectLiterals type="FooterLayout" />
            )}
          </MainLayout>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}

