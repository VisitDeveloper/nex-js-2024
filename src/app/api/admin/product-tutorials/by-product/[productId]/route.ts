import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminAuthError,
  requirePortalStrapiSession,
  strapiAdminFetch,
  strapiBaseUrl,
} from "lib/admin-strapi";
import { canManageProducts } from "lib/portal-roles";
import {
  blocksFromStrapiAttributes,
  blocksToStrapiPayload,
  type ClientTutorialBlock,
  type TutorialBlockPayload,
} from "lib/tutorial-blocks";

const LOCALE = "en";

const blockSchema: z.ZodType<ClientTutorialBlock> = z.discriminatedUnion("kind", [
  z.object({ key: z.string(), kind: z.literal("richtext"), body: z.string() }),
  z.object({
    key: z.string(),
    kind: z.literal("image"),
    mediaId: z.number().nullable(),
    previewUrl: z.string().nullable().optional(),
  }),
  z.object({
    key: z.string(),
    kind: z.literal("video"),
    mediaId: z.number().nullable(),
    previewUrl: z.string().nullable().optional(),
  }),
  z.object({ key: z.string(), kind: z.literal("embed"), url: z.string() }),
]);

const putBodySchema = z.object({
  blocks: z.array(blockSchema),
});

function sanitizeStrapiBlocks(blocks: TutorialBlockPayload[]): TutorialBlockPayload[] {
  return blocks.filter((b) => {
    if (b.__component === "shared.rich-text") return (b.body || "").trim().length > 0;
    if (b.__component === "shared.video-embed") return (b.url || "").trim().length > 0;
    if (b.__component === "shared.media") return b.file != null && b.file > 0;
    if (b.__component === "tutorial.video-file") return b.media != null && b.media > 0;
    return true;
  });
}

function populateQuery(): string {
  const p = new URLSearchParams();
  p.set("locale", LOCALE);
  p.set("populate[blocks][populate]", "*");
  return p.toString();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageProducts(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const productId = params.productId;
    if (!productId || !/^\d+$/.test(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const qs = new URLSearchParams();
    qs.set("filters[product][id][$eq]", productId);
    qs.set("pagination[pageSize]", "1");
    qs.set("locale", LOCALE);
    qs.set("populate[blocks][populate]", "*");

    const res = await strapiAdminFetch(`/api/product-tutorials?${qs.toString()}`, strapiJwt);
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error?.message || payload?.message || "Failed to load tutorial",
          details: payload,
        },
        { status: res.status }
      );
    }

    const row = Array.isArray(payload?.data) ? payload.data[0] : null;
    const base = strapiBaseUrl() || "";
    if (!row) {
      return NextResponse.json({
        tutorialId: null,
        blocks: [] as ClientTutorialBlock[],
      });
    }

    const attrs = row.attributes as { blocks?: unknown } | undefined;
    const blocks = blocksFromStrapiAttributes(attrs?.blocks, base);

    return NextResponse.json({
      tutorialId: row.id as number,
      blocks,
    });
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageProducts(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const productId = params.productId;
    if (!productId || !/^\d+$/.test(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const json = await req.json();
    const { blocks: clientBlocks } = putBodySchema.parse(json);
    const strapiBlocks = sanitizeStrapiBlocks(blocksToStrapiPayload(clientBlocks));

    const findQs = new URLSearchParams();
    findQs.set("filters[product][id][$eq]", productId);
    findQs.set("pagination[pageSize]", "1");
    findQs.set("locale", LOCALE);

    const findRes = await strapiAdminFetch(
      `/api/product-tutorials?${findQs.toString()}`,
      strapiJwt
    );
    const findPayload = await findRes.json().catch(() => ({}));
    if (!findRes.ok) {
      return NextResponse.json(
        {
          error:
            findPayload?.error?.message ||
            findPayload?.message ||
            "Failed to resolve tutorial",
          details: findPayload,
        },
        { status: findRes.status }
      );
    }

    const existing = Array.isArray(findPayload?.data) ? findPayload.data[0] : null;
    const publishedAt = new Date().toISOString();

    if (existing?.id != null) {
      const putRes = await strapiAdminFetch(
        `/api/product-tutorials/${existing.id}?${populateQuery()}`,
        strapiJwt,
        {
          method: "PUT",
          body: JSON.stringify({
            data: {
              blocks: strapiBlocks,
              publishedAt,
            },
          }),
        }
      );
      const putPayload = await putRes.json().catch(() => ({}));
      if (!putRes.ok) {
        return NextResponse.json(
          {
            error:
              putPayload?.error?.message ||
              putPayload?.message ||
              "Failed to update tutorial",
            details: putPayload,
          },
          { status: putRes.status }
        );
      }
      const base = strapiBaseUrl() || "";
      const attrs = putPayload?.data?.attributes as { blocks?: unknown } | undefined;
      return NextResponse.json({
        tutorialId: putPayload?.data?.id as number,
        blocks: blocksFromStrapiAttributes(attrs?.blocks, base),
      });
    }

    const postRes = await strapiAdminFetch(
      `/api/product-tutorials?${populateQuery()}`,
      strapiJwt,
      {
        method: "POST",
        body: JSON.stringify({
          data: {
            product: Number(productId),
            blocks: strapiBlocks,
            publishedAt,
          },
        }),
      }
    );
    const postPayload = await postRes.json().catch(() => ({}));
    if (!postRes.ok) {
      return NextResponse.json(
        {
          error:
            postPayload?.error?.message ||
            postPayload?.message ||
            "Failed to create tutorial",
          details: postPayload,
        },
        { status: postRes.status }
      );
    }
    const base = strapiBaseUrl() || "";
    const attrs = postPayload?.data?.attributes as { blocks?: unknown } | undefined;
    return NextResponse.json({
      tutorialId: postPayload?.data?.id as number,
      blocks: blocksFromStrapiAttributes(attrs?.blocks, base),
    });
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
