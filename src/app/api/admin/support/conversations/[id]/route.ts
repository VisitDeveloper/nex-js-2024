import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AdminAuthError, requirePortalStrapiSession } from "lib/admin-strapi";
import { canManageSupport } from "lib/portal-roles";
import { numericEntryIdFromParams } from "lib/route-dynamic-id";
import { StrapiSupportError, strapiSupportStaffGetById, strapiSupportStaffSetStatus } from "lib/strapi-support";
import { serializeConversationFullAdmin } from "lib/support-serialize";

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const id = await numericEntryIdFromParams(context.params);
  if (!id) {
    return NextResponse.json({ error: "Invalid conversation id" }, { status: 404 });
  }
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageSupport(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const doc = await strapiSupportStaffGetById(strapiJwt, id);
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      conversation: serializeConversationFullAdmin(doc),
    });
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if (e instanceof StrapiSupportError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Support is temporarily unavailable" }, { status: 503 });
  }
}

const patchSchema = z.object({
  status: z.enum(["open", "closed"]),
});

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const id = await numericEntryIdFromParams(context.params);
  if (!id) {
    return NextResponse.json({ error: "Invalid conversation id" }, { status: 404 });
  }
  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageSupport(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const doc = await strapiSupportStaffSetStatus(strapiJwt, id, body.status);
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      conversation: serializeConversationFullAdmin(doc),
    });
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if (e instanceof StrapiSupportError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Could not update" }, { status: 503 });
  }
}
