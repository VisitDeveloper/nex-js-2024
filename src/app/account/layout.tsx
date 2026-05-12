import React from "react";
import { Fredoka } from "next/font/google";
import PortalCustomerShell from "components/specific_elements/portal/portal-customer-shell";

const accountFont = Fredoka({ subsets: ["latin"], display: "swap" });

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={accountFont.className}>
      <PortalCustomerShell>{children}</PortalCustomerShell>
    </div>
  );
}
