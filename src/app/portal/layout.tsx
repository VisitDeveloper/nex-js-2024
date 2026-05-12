import React from "react";
import { Fredoka } from "next/font/google";
import PortalAdminShell from "components/specific_elements/portal/portal-admin-shell";

/** Fredoka — same as `src/app/layout.tsx` and the public homepage. */
const portalFont = Fredoka({ subsets: ["latin"], display: "swap" });

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={portalFont.className}>
      <PortalAdminShell>{children}</PortalAdminShell>
    </div>
  );
}
