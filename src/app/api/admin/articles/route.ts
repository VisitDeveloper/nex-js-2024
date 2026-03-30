import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminAuthError,
  requirePortalStrapiSession,
  strapiAdminFetch,
} from "lib/admin-strapi";
import { canManageArticles } from "lib/portal-roles";
import { sanitizeArticleBlocksForStrapi } from "lib/article-blocks";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  slug: z.string().optional(),
  category: z.coerce.number().optional(),
  cover: z.coerce.number().optional(),
  blocks: z.array(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageArticles(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const json = await req.json();
    const body = createSchema.parse(json);

    const data: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      publishedAt: new Date().toISOString(),
    };
    if (body.slug) data.slug = body.slug;
    if (body.category) data.category = body.category;
    if (body.cover != null) data.cover = body.cover;
    if (body.blocks !== undefined) {
      data.blocks = sanitizeArticleBlocksForStrapi(body.blocks, { preserveComponentIds: false });
    }

    const res = await strapiAdminFetch("/api/articles", strapiJwt, {
      method: "POST",
      body: JSON.stringify({ data }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error?.message ||
            payload?.message ||
            "Failed to create article",
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
