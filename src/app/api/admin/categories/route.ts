import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminAuthError,
  requirePortalStrapiSession,
  strapiAdminFetch,
} from "lib/admin-strapi";
import { canManageCategories } from "lib/portal-roles";
import { strapiErrorMessage } from "lib/strapi-error-message";

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  cover: z.coerce.number().optional(),
});

export async function GET() {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageCategories(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const res = await strapiAdminFetch(
      "/api/categories?pagination[pageSize]=200&sort=name:asc&populate[cover]=true",
      strapiJwt
    );
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error?.message ||
            payload?.message ||
            "Failed to load categories",
          details: payload,
        },
        { status: res.status }
      );
    }
    return NextResponse.json(payload);
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageCategories(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const json = await req.json();
    const body = createSchema.parse(json);
    const data: Record<string, unknown> = {
      name: body.name,
    };
    if (body.slug) data.slug = body.slug;
    if (body.description) data.description = body.description;
    if (body.cover != null) data.cover = body.cover;

    let res = await strapiAdminFetch("/api/categories", strapiJwt, {
      method: "POST",
      body: JSON.stringify({ data }),
    });
    let payload = await res.json().catch(() => ({}));

    if (!res.ok && (res.status === 405 || res.status === 404)) {
      res = await strapiAdminFetch("/api/categories/portal-create", strapiJwt, {
        method: "POST",
        body: JSON.stringify({ data }),
      });
      payload = await res.json().catch(() => ({}));
    }

    if (!res.ok) {
      const msg =
        strapiErrorMessage(payload) ||
        payload?.error?.message ||
        payload?.message ||
        "Failed to create category";
      return NextResponse.json(
        {
          error: msg,
          details: payload,
        },
        { status: res.status }
      );
    }
    return NextResponse.json(payload);
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", issues: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
