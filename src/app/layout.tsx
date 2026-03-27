
import "./globals.css";

import React from "react";
import { Fredoka } from "next/font/google";
import type { Metadata } from "next";
import { cn } from "lib/utils";

import ClientLayout from "./ClientLayout";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://bwaveedu.com";

const fredoka = Fredoka({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.webmanifest",
  themeColor: "#19C1B6",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icon.svg"],
  },
  title: {
    default: "BrainWave Academy",
    template: "%s | BrainWave Academy",
  },
  description:
    "BrainWave Academy delivers app-based learning tools and dyslexia-friendly experiences for early education.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    url: "./",
    siteName: "BrainWave Academy",
    title: "BrainWave Academy",
    description:
      "App-based books and dyslexia-friendly learning tools for early education.",
    images: [
      {
        url: `${siteUrl}/linkedin-cover-1584x396.svg`,
        width: 1584,
        height: 396,
        alt: "BrainWave Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BrainWave Academy",
    description:
      "App-based books and dyslexia-friendly learning tools for early education.",
    images: [`${siteUrl}/linkedin-cover-1584x396.svg`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body
        className={cn(
          "antialiased bg-mainBackground overflow-x-hidden",
          fredoka.className
        )}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
