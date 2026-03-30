export type AdminCustomerRow = {
  id: number;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  /** Dominant currency for display (last revenue order, else USD). */
  currency: string;
  lastActivityAt: string | null;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string | null;
  profileId: number | null;
  phoneNumber: string | null;
  highSpender: boolean;
};

export type AdminCustomerKpis = {
  totalCustomers: number;
  activeUsers: number;
  newThisMonth: number;
  avgOrderValue: number;
  avgOrderCurrency: string;
};

export function formatAdminMoney(amount: number, currency: string): string {
  const c = currency?.toUpperCase() === "IRR" ? "IRR" : "USD";
  try {
    return new Intl.NumberFormat(c === "IRR" ? "fa-IR" : "en-US", {
      style: "currency",
      currency: c,
      maximumFractionDigits: c === "IRR" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${c}`;
  }
}

export function formatAdminDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
