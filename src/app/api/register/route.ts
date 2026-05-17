import "lib/node-buffer-polyfill";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { COOKIE_NAME, MAX_AGE, STRAPI_JWT_COOKIE } from "config/constant";
import { getStrapiOrigin } from "lib/strapi-origin";
import { ensureCustomerProfileForUser } from "lib/ensure-customer-profile";
import { serialize } from "cookie";
import { sign } from "jsonwebtoken";

const registerUserSchema = z.object({
  userName: z.string().min(2, "Username must be at least 2 characters."),
  email: z.string().email(),
  password: z.string().min(4, "Password must be at least 4 characters."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerUserSchema.parse(body);
    const strapiBase = getStrapiOrigin() || "http://localhost:1337";

    const strapiRegisterResponse = await fetch(`${strapiBase}/api/auth/local/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: validatedData.userName,
        email: validatedData.email,
        password: validatedData.password,
      }),
    });

    const strapiPayload = await strapiRegisterResponse.json();
    if (!strapiRegisterResponse.ok) {
      const message =
        strapiPayload?.error?.message || strapiPayload?.message || "Registration failed.";
      return NextResponse.json({ error: message }, { status: strapiRegisterResponse.status });
    }

    const role =
      strapiPayload?.user?.role?.name ||
      strapiPayload?.user?.role?.type ||
      strapiPayload?.user?.role ||
      "user";

    const uid = Number(strapiPayload?.user?.id);
    if (Number.isFinite(uid) && uid > 0 && strapiPayload?.jwt) {
      await ensureCustomerProfileForUser(strapiPayload.jwt, uid, validatedData.userName);
    }

    const secret = process.env.JWT_SECRET || "";
    const token = sign(
      {
        userId: strapiPayload.user?.id,
        email: strapiPayload.user?.email,
        role,
      },
      secret,
      { expiresIn: MAX_AGE }
    );

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: MAX_AGE,
      path: "/",
    };

    const serialized = serialize(COOKIE_NAME, token, cookieOpts);

    const response = NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
    response.headers.append("Set-Cookie", serialized);
    if (strapiPayload?.jwt) {
      response.headers.append(
        "Set-Cookie",
        serialize(STRAPI_JWT_COOKIE, strapiPayload.jwt, cookieOpts)
      );
    }
    return response;
  } catch {
    return NextResponse.json({ error: "There was a problem" }, { status: 500 });
  }
}