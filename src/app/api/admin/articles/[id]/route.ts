import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminAuthError,
  requirePortalStrapiSession,
  strapiAdminFetch,
} from "lib/admin-strapi";
import { canManageArticles } from "lib/portal-roles";
import { sanitizeArticleBlocksForStrapi } from "lib/article-blocks";

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  slug: z.string().optional(),
  category: z.coerce.number().nullable().optional(),
  cover: z.coerce.number().nullable().optional(),
  blocks: z.array(z.any()).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageArticles(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const json = await req.json();
    const body = patchSchema.parse(json);
    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.slug !== undefined) data.slug = body.slug;
    if (body.category !== undefined) {
      data.category = body.category;
    }
    if (body.cover !== undefined) {
      data.cover = body.cover;
    }
    if (body.blocks !== undefined) {
      data.blocks = sanitizeArticleBlocksForStrapi(body.blocks, { preserveComponentIds: true });
    }

    const res = await strapiAdminFetch(`/api/articles/${id}`, strapiJwt, {
      method: "PUT",
      body: JSON.stringify({ data }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error?.message ||
            payload?.message ||
            "Failed to update article",
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageArticles(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const res = await strapiAdminFetch(`/api/articles/${id}`, strapiJwt, {
      method: "DELETE",
    });
    const text = await res.text();
    let payload: Record<string, unknown> = {};
    if (text) {
      try {
        payload = JSON.parse(text) as Record<string, unknown>;
      } catch {
        /* empty or non-JSON body on success */
      }
    }
    if (!res.ok) {
      const err = payload.error as { message?: string } | undefined;
      const msg =
        (typeof err?.message === "string" && err.message) ||
        (typeof payload.message === "string" && payload.message) ||
        "Failed to delete article";
      return NextResponse.json({ error: msg, details: payload }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
