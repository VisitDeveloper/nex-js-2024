"use client";

import "./globals.css";

import { DynamicObjectLiterals, MainLayout } from "components";

import { AnimatePresence } from "motion/react";
import { Fredoka } from "next/font/google";
import Head from "next/head";
import React from "react";
import { ThemeProvider } from "provider/ThemeProvider";
import { cn } from "lib/utils";
import { dir } from "i18next";
import { usePathname } from "next/navigation";

const fredoka = Fredoka({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: // params
Readonly<{
  children: React.ReactNode;
  // params: any;
}>) {
  // lang={lng} dir={dir(lng)}
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");
  const isAdminPage = pathname.startsWith("/admin");
  console.log("pathname ", pathname.split("/").filter(Boolean)[0]);
  const routeObjectWithOutLayout: any = {
    auth: "/auth",
    admin: "/admin",
  };

  return (
    <html lang="en" dir="ltr">
      <Head>
        <title>Brain Wave Children</title>
      </Head>
      <body
        className={cn(
          `antialiased bg-mainBackground overflow-x-hidden`,
          fredoka.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="bg-[#02E3C6] sticky top-0 z-10 flex items-center justify-center h-12">
            <span>Applications open Summer-25 April!!!</span>
          </div>
          <AnimatePresence mode="popLayout">
            <MainLayout className="">
              {!routeObjectWithOutLayout[
                pathname.split("/").filter(Boolean)[0]
              ] && <DynamicObjectLiterals type="HeaderLayout" />}
              {children}
              {!routeObjectWithOutLayout[
                pathname.split("/").filter(Boolean)[0]
              ] && <DynamicObjectLiterals type="FooterLayout" />}
            </MainLayout>
          </AnimatePresence>
        </ThemeProvider>
      </body>
    </html>
  );
}
