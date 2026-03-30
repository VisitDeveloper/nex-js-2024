import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, STRAPI_JWT_COOKIE } from "config/constant";
import { verifyAppJwt } from "lib/auth-session";
import { numericEntryIdFromParams } from "lib/route-dynamic-id";
import { StrapiSupportError, strapiSupportTokenGetById } from "lib/strapi-support";
import { serializeConversationFullCustomer } from "lib/support-serialize";

function customerSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAppJwt(token);
}

export async function GET(
  _req: NextRequest,
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
  const strapiJwt = cookies().get(STRAPI_JWT_COOKIE)?.value;
  try {
    const doc = await strapiSupportTokenGetById(id, strapiJwt);
    if (!doc || doc.strapiUserId !== user.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      conversation: serializeConversationFullCustomer(doc),
    });
  } catch (e) {
    if (e instanceof StrapiSupportError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Support is temporarily unavailable" }, { status: 503 });
  }
}
