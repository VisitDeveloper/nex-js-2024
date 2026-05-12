/**
 * Allowed Strapi users-permissions role.type values for /portal/admin.
 * Keys are normalized (lowercase, spaces → hyphens). Do not put display names here.
 * @see brainwave-strapi/src/index.js SHOP_ROLES + staff policies
 */
export const PORTAL_ADMIN_ROLE_TYPES = new Set([
  "admin",
  "super-admin",
  "store-manager",
  "content-editor",
  "support-agent",
]);

export function normalizeRoleKey(role: string | undefined): string {
  if (!role) return "";
  return String(role).trim().toLowerCase().replace(/\s+/g, "-");
}

export function canAccessPortalAdmin(role: string | undefined): boolean {
  return PORTAL_ADMIN_ROLE_TYPES.has(normalizeRoleKey(role));
}

export function canManageProducts(role: string | undefined): boolean {
  const r = normalizeRoleKey(role);
  return r === "admin" || r === "super-admin" || r === "store-manager";
}

export function canManageArticles(role: string | undefined): boolean {
  const r = normalizeRoleKey(role);
  return (
    r === "admin" ||
    r === "super-admin" ||
    r === "store-manager" ||
    r === "content-editor"
  );
}

export function canManageCategories(role: string | undefined): boolean {
  return canManageProducts(role) || canManageArticles(role);
}

/** Support inbox: dedicated agents plus broader staff roles. */
export function canManageSupport(role: string | undefined): boolean {
  const r = normalizeRoleKey(role);
  return (
    r === "admin" ||
    r === "super-admin" ||
    r === "store-manager" ||
    r === "support-agent"
  );
}

/** Orders + fulfillment: matches Strapi `transitionStatus` (not content-editor). */
export function canManageOrders(role: string | undefined): boolean {
  const r = normalizeRoleKey(role);
  return (
    r === "admin" ||
    r === "super-admin" ||
    r === "store-manager" ||
    r === "support-agent"
  );
}
