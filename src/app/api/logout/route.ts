import { NextResponse } from "next/server";
import { serialize } from "cookie";
import { COOKIE_NAME, STRAPI_JWT_COOKIE } from "config/constant";

const clearedCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 0,
  path: "/",
};

/**
 * Clears app session (OutSideJWT) and Strapi staff token (bw_strapi_jwt).
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", serialize(COOKIE_NAME, "", clearedCookie));
  res.headers.append("Set-Cookie", serialize(STRAPI_JWT_COOKIE, "", clearedCookie));
  return res;
}
