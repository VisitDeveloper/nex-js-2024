import { NextResponse } from "next/server";
import { AdminAuthError, requirePortalStrapiSession } from "lib/admin-strapi";
import { canManageSupport } from "lib/portal-roles";
import { StrapiSupportError, strapiSupportStaffList } from "lib/strapi-support";
import { serializeConversationAdmin } from "lib/support-serialize";

export async function GET() {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageSupport(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const rows = await strapiSupportStaffList(strapiJwt);
    return NextResponse.json({
      conversations: rows.map(serializeConversationAdmin),
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
