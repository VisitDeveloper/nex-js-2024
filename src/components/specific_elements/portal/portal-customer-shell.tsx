"use client";

import type { ReactNode } from "react";
import PortalAppShell, { CUSTOMER_PORTAL_SHELL_CONFIG } from "./portal-app-shell";

export default function PortalCustomerShell({ children }: { children: ReactNode }) {
  return <PortalAppShell config={CUSTOMER_PORTAL_SHELL_CONFIG}>{children}</PortalAppShell>;
}
