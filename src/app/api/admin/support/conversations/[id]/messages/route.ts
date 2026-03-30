import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { COOKIE_NAME } from "config/constant";
import { verifyAppJwt, sessionDisplayName } from "lib/auth-session";
import { AdminAuthError, requirePortalStrapiSession } from "lib/admin-strapi";
import { canManageSupport } from "lib/portal-roles";
import { numericEntryIdFromParams } from "lib/route-dynamic-id";
import { StrapiSupportError, strapiSupportStaffAppendMessage } from "lib/strapi-support";
import { serializeConversationFullAdmin, serializeMessage } from "lib/support-serialize";

const bodySchema = z.object({
  body: z.string().min(1).max(8000),
});

/** Body: `{ "body": "reply text" }` — Strapi entry id in the URL (digits only). */
export async function POST(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
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
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageSupport(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const token = cookies().get(COOKIE_NAME)?.value;
    const appUser = token ? verifyAppJwt(token) : null;
    const authorLabel = appUser ? sessionDisplayName(appUser) : "Support";

    const doc = await strapiSupportStaffAppendMessage(strapiJwt, id, text, authorLabel);
    if (!doc) {
      return NextResponse.json(
        { error: "Conversation not found or could not be updated in Strapi." },
        { status: 404 }
      );
    }
    const last = doc.messages[doc.messages.length - 1];
    return NextResponse.json({
      message: serializeMessage(last),
      conversation: serializeConversationFullAdmin(doc),
    });
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if (e instanceof StrapiSupportError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Could not send message" }, { status: 503 });
  }
}
