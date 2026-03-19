"use client";

import React from "react";
import { AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";

import { DynamicObjectLiterals, MainLayout } from "components";
import { ThemeProvider } from "provider/ThemeProvider";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Pages under these top-level routes render without the shared header/footer.
  const routeObjectWithOutLayout: Record<string, true> = {
    auth: true,
    admin: true,
  };

  const topLevelRoute = pathname.split("/").filter(Boolean)[0] || "";
  const shouldShowLayout =
    routeObjectWithOutLayout[topLevelRoute] !== true;

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AnimatePresence mode="popLayout">
        <MainLayout className="">
          {shouldShowLayout && <DynamicObjectLiterals type="HeaderLayout" />}
          {children}
          {shouldShowLayout && <DynamicObjectLiterals type="FooterLayout" />}
        </MainLayout>
      </AnimatePresence>
    </ThemeProvider>
  );
}

