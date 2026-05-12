import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { COOKIE_NAME, STRAPI_JWT_COOKIE } from "config/constant";
import { verifyAppJwt } from "lib/auth-session";
import { numericEntryIdFromParams } from "lib/route-dynamic-id";
import { StrapiSupportError, strapiSupportTokenAppendCustomerMessage } from "lib/strapi-support";
import { serializeConversationFullCustomer, serializeMessage } from "lib/support-serialize";

function customerSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAppJwt(token);
}

const bodySchema = z.object({
  body: z.string().min(1).max(8000),
});

export async function POST(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const user = customerSession();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const id = await numericEntryIdFromParams(context.params);
  if (!id) {
    return NextResponse.json({ error: "Invalid conversation id" }, { status: 404 });
  }
  let json: z.infer<typeof bodySchema>;
  try {
    json = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const text = json.body.trim();
  const strapiJwt = cookies().get(STRAPI_JWT_COOKIE)?.value;
  try {
    const doc = await strapiSupportTokenAppendCustomerMessage(id, text, user.userId, strapiJwt);
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const last = doc.messages[doc.messages.length - 1];
    return NextResponse.json({
      message: serializeMessage(last),
      conversation: serializeConversationFullCustomer(doc),
    });
  } catch (e) {
    if (e instanceof StrapiSupportError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Could not send message" }, { status: 503 });
  }
}
