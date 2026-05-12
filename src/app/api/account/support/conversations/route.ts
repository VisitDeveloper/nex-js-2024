import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { COOKIE_NAME, STRAPI_JWT_COOKIE } from "config/constant";
import { verifyAppJwt } from "lib/auth-session";
import { StrapiSupportError, strapiSupportTokenCreate, strapiSupportTokenListForUser } from "lib/strapi-support";
import { serializeConversationCustomer, serializeConversationFullCustomer } from "lib/support-serialize";

function customerSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAppJwt(token);
}

export async function GET() {
  const user = customerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const strapiJwt = cookies().get(STRAPI_JWT_COOKIE)?.value;
  try {
    const rows = await strapiSupportTokenListForUser(user.userId, strapiJwt);
    return NextResponse.json({
      conversations: rows.map(serializeConversationCustomer),
    });
  } catch (e) {
    if (e instanceof StrapiSupportError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Support is temporarily unavailable" }, { status: 503 });
  }
}

const postSchema = z.object({
  subject: z.string().max(300).optional(),
  initialMessage: z.string().min(1).max(8000),
});

export async function POST(req: NextRequest) {
  const user = customerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  let body: z.infer<typeof postSchema>;
  try {
    body = postSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const subject = body.subject?.trim() || undefined;
  const initialMessage = body.initialMessage.trim();
  const strapiJwt = cookies().get(STRAPI_JWT_COOKIE)?.value;
  try {
    const doc = await strapiSupportTokenCreate(
      {
        strapiUserId: user.userId,
        userEmail: user.email,
        subject,
        initialMessage,
      },
      strapiJwt
    );
    return NextResponse.json({
      conversation: serializeConversationFullCustomer(doc),
    });
  } catch (e) {
    if (e instanceof StrapiSupportError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Could not start conversation" }, { status: 503 });
  }
}
