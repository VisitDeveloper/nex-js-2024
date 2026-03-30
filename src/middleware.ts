import { NextResponse } from "next/server";
import { COOKIE_NAME } from "config/constant";
import { type NextRequest } from "next/server";
import { canAccessPortalAdmin } from "lib/portal-roles";

function parseJwtPayload(token: string): { role?: string; exp?: number } | null {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/** Cookie present, structurally valid JWT, and not past `exp` (if present). */
function getValidSession(token: string | undefined): { role: string } | null {
  if (!token) return null;
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return null;
  }
  const role = payload.role;
  return { role: typeof role === "string" ? role : "user" };
}

function isAdminAuthPath(pathname: string): boolean {
  return pathname === "/auth/admin" || pathname.startsWith("/auth/admin/");
}

function isUserAuthPath(pathname: string): boolean {
  return pathname === "/auth" || pathname === "/auth/";
}

function isShopCheckoutPath(pathname: string): boolean {
  return pathname === "/shop/checkout" || pathname.startsWith("/shop/checkout/");
}

function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/portal/admin") ||
    pathname === "/account" ||
    pathname.startsWith("/account/")
  );
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = getValidSession(request.cookies.get(COOKIE_NAME)?.value);

  if (isAdminAuthPath(pathname)) {
    if (session) {
      if (canAccessPortalAdmin(session.role)) {
        return NextResponse.redirect(new URL("/portal/admin", request.url));
      }
      return NextResponse.redirect(new URL("/account", request.url));
    }
    return NextResponse.next();
  }

  if (isUserAuthPath(pathname)) {
    if (session) {
      const raw = request.nextUrl.searchParams.get("callbackUrl");
      const next =
        raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
      return NextResponse.redirect(new URL(next, request.url));
    }
    return NextResponse.next();
  }

  if (isShopCheckoutPath(pathname)) {
    if (!session) {
      const signIn = new URL("/auth", request.url);
      signIn.searchParams.set("callbackUrl", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(signIn);
    }
    return NextResponse.next();
  }

  if (isProtectedPath(pathname)) {
    if (!session) {
      const signIn = pathname.startsWith("/portal/admin") ? "/auth/admin" : "/auth";
      return NextResponse.redirect(new URL(signIn, request.url));
    }
    if (pathname.startsWith("/portal/admin") && !canAccessPortalAdmin(session.role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Include exact /portal/admin; :path* alone can miss the index route in some Next versions.
  matcher: [
    "/portal/admin",
    "/portal/admin/:path*",
    "/account",
    "/account/:path*",
    "/auth",
    "/auth/",
    "/auth/admin",
    "/auth/admin/:path*",
    "/shop/checkout",
    "/shop/checkout/:path*",
  ],
};
