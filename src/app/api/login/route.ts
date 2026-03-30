import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";
import { COOKIE_NAME, MAX_AGE, STRAPI_JWT_COOKIE } from "config/constant";
import { getStrapiOrigin } from "lib/strapi-origin";
import { ensureCustomerProfileForUser } from "lib/ensure-customer-profile";
import { verifyHcaptchaToken } from "lib/verify-hcaptcha";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
  hcaptchaToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { email, password, hcaptchaToken } = await req.json();
    const validatedData = loginSchema.parse({ email, password, hcaptchaToken });
    const strapiBase = getStrapiOrigin() || "http://localhost:1337";

    if (process.env.HCAPTCHA_SECRET_KEY?.trim()) {
      const forwarded = req.headers.get("x-forwarded-for");
      const remoteip =
        (forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "").trim() ||
        undefined;
      const ok = await verifyHcaptchaToken(validatedData.hcaptchaToken, remoteip);
      if (!ok) {
        return NextResponse.json(
          { error: "Captcha verification failed. Please try again." },
          { status: 400 }
        );
      }
    }

    const strapiLoginResponse = await fetch(`${strapiBase}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: validatedData.email,
        password: validatedData.password,
      }),
    });


    const strapiPayload = await strapiLoginResponse.json();
    if (!strapiLoginResponse.ok) {
      const message =
        strapiPayload?.error?.message || strapiPayload?.message || "Login failed.";
      return NextResponse.json({ error: message }, { status: strapiLoginResponse.status });
    }


    const strapiProfileResponse = await fetch(`${strapiBase}/api/users/me?populate=role`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${strapiPayload.jwt}` },
    });

    const strapiProfilePayload = await strapiProfileResponse.json();
    if (!strapiProfileResponse.ok) {
      const message =
        strapiProfilePayload?.error?.message || strapiProfilePayload?.message || "Login failed.";
      return NextResponse.json({ error: message }, { status: strapiProfilePayload.status });
    }

    // Prefer Strapi role.type (e.g. store-manager) for app checks; name is display-only.
    const role =
      strapiProfilePayload.role?.type ||
      strapiProfilePayload.role?.name ||
      strapiProfilePayload.role ||
      "user";

    const uid = Number(strapiPayload.user?.id);
    const displayName =
      (typeof strapiProfilePayload.username === "string" && strapiProfilePayload.username) ||
      (typeof strapiPayload.user?.username === "string" && strapiPayload.user.username) ||
      validatedData.email;
    if (Number.isFinite(uid) && uid > 0) {
      await ensureCustomerProfileForUser(strapiPayload.jwt, uid, displayName);
    }

    const secret = process.env.JWT_SECRET || "";
    const token = sign(
      {
        userId: strapiPayload.user?.id,
        email: strapiPayload.user?.email,
        role,
      },
      secret,
      {
        expiresIn: MAX_AGE,
      }
    );

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // Lax: session survives top-level return from Stripe/OAuth; Strict strips cookies on cross-site redirects.
      sameSite: "lax" as const,
      maxAge: MAX_AGE,
      path: "/",
    };

    const serialized = serialize(COOKIE_NAME, token, cookieOpts);
    const strapiJwtSerialized = serialize(
      STRAPI_JWT_COOKIE,
      strapiPayload.jwt,
      cookieOpts
    );

    const response = NextResponse.json({
      message: "Login was successful",
      token,
      user: {
        id: strapiPayload.user?.id,
        email: strapiPayload.user?.email,
        role,
      },
    });

    response.headers.append("Set-Cookie", serialized);
    response.headers.append("Set-Cookie", strapiJwtSerialized);
    return response;
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}