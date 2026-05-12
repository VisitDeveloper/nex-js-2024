import { NextRequest, NextResponse } from "next/server";
import {
  AdminAuthError,
  requirePortalStrapiSession,
  strapiBaseUrl,
} from "lib/admin-strapi";
import { canManageCategories, canManageProducts } from "lib/portal-roles";

const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

/**
 * Forward a single file to Strapi /api/upload (Content API).
 * Form field name must be `file` (single File).
 */
export async function POST(req: NextRequest) {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageCategories(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob) || file.size === 0) {
      return NextResponse.json({ error: "Missing or empty file" }, { status: 400 });
    }
    const allowVideo = canManageProducts(role);
    const isImage = !file.type || file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (isVideo) {
      if (!allowVideo) {
        return NextResponse.json({ error: "Video uploads require catalog admin access" }, { status: 403 });
      }
      if (file.size > MAX_VIDEO_BYTES) {
        return NextResponse.json({ error: "Video file is too large (max 80MB)" }, { status: 400 });
      }
    } else if (!isImage) {
      return NextResponse.json({ error: "Only image or video uploads are allowed" }, { status: 400 });
    }

    const base = strapiBaseUrl();
    if (!base) {
      return NextResponse.json({ error: "Strapi URL is not configured" }, { status: 500 });
    }

    const outgoing = new FormData();
    const filename =
      file instanceof File && file.name ? file.name : "upload";
    outgoing.append("files", file, filename);

    const res = await fetch(`${base}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${strapiJwt}`,
      },
      body: outgoing,
      cache: "no-store",
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error?.message ||
            payload?.message ||
            "Upload failed",
          details: payload,
        },
        { status: res.status }
      );
    }

    const list = Array.isArray(payload) ? payload : [payload];
    const first = list[0];
    const id = first?.id;
    if (id == null) {
      return NextResponse.json({ error: "Unexpected upload response" }, { status: 502 });
    }

    return NextResponse.json({ id });
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
