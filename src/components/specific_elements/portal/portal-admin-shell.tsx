"use client";

import type { ReactNode } from "react";
import PortalAppShell, { ADMIN_PORTAL_SHELL_CONFIG } from "./portal-app-shell";

export default function PortalAdminShell({ children }: { children: ReactNode }) {
  return <PortalAppShell config={ADMIN_PORTAL_SHELL_CONFIG}>{children}</PortalAppShell>;
}
