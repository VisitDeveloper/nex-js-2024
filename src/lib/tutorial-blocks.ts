/** Strapi dynamic-zone components for product-tutorial (admin + customer JSON). */

export const TUTORIAL_COMPONENTS = {
  richText: "shared.rich-text",
  media: "shared.media",
  videoEmbed: "shared.video-embed",
  videoFile: "tutorial.video-file",
} as const;

export type TutorialBlockPayload =
  | { __component: typeof TUTORIAL_COMPONENTS.richText; body: string }
  | { __component: typeof TUTORIAL_COMPONENTS.media; file: number | null }
  | { __component: typeof TUTORIAL_COMPONENTS.videoEmbed; url: string }
  | { __component: typeof TUTORIAL_COMPONENTS.videoFile; media: number | null };

export type ClientTutorialBlock =
  | { key: string; kind: "richtext"; body: string }
  | { key: string; kind: "image"; mediaId: number | null; previewUrl?: string | null }
  | { key: string; kind: "video"; mediaId: number | null; previewUrl?: string | null }
  | { key: string; kind: "embed"; url: string };

function mediaUrlFromStrapi(data: unknown, baseUrl: string): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as { attributes?: { url?: string } };
  const u = d.attributes?.url;
  if (typeof u !== "string" || !u) return null;
  if (u.startsWith("http")) return u;
  return `${baseUrl.replace(/\/$/, "")}${u}`;
}

/** Map Strapi REST `attributes.blocks` (populated) to client editor rows. */
export function blocksFromStrapiAttributes(
  blocks: unknown,
  strapiOrigin: string
): ClientTutorialBlock[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((raw, index) => {
    const b = raw as Record<string, unknown>;
    const comp = b.__component as string;
    const key = `${comp}-${index}-${(b as { id?: number }).id ?? ""}`;
    if (comp === TUTORIAL_COMPONENTS.richText) {
      return {
        key,
        kind: "richtext",
        body: typeof b.body === "string" ? b.body : "",
      };
    }
    if (comp === TUTORIAL_COMPONENTS.media) {
      const file = b.file as { data?: unknown } | undefined;
      const id =
        file?.data && typeof file.data === "object" && "id" in file.data
          ? Number((file.data as { id: number }).id)
          : null;
      return {
        key,
        kind: "image",
        mediaId: Number.isFinite(id) ? id : null,
        previewUrl: mediaUrlFromStrapi(file?.data, strapiOrigin),
      };
    }
    if (comp === TUTORIAL_COMPONENTS.videoEmbed) {
      return {
        key,
        kind: "embed",
        url: typeof b.url === "string" ? b.url : "",
      };
    }
    if (comp === TUTORIAL_COMPONENTS.videoFile) {
      const media = b.media as { data?: unknown } | undefined;
      const id =
        media?.data && typeof media.data === "object" && "id" in media.data
          ? Number((media.data as { id: number }).id)
          : null;
      return {
        key,
        kind: "video",
        mediaId: Number.isFinite(id) ? id : null,
        previewUrl: mediaUrlFromStrapi(media?.data, strapiOrigin),
      };
    }
    return {
      key,
      kind: "richtext",
      body: "",
    };
  });
}

export function blocksToStrapiPayload(blocks: ClientTutorialBlock[]): TutorialBlockPayload[] {
  return blocks.map((b) => {
    if (b.kind === "richtext") {
      return { __component: TUTORIAL_COMPONENTS.richText, body: b.body || "" };
    }
    if (b.kind === "image") {
      return {
        __component: TUTORIAL_COMPONENTS.media,
        file: b.mediaId != null && b.mediaId > 0 ? b.mediaId : null,
      };
    }
    if (b.kind === "embed") {
      return { __component: TUTORIAL_COMPONENTS.videoEmbed, url: b.url?.trim() || "" };
    }
    return {
      __component: TUTORIAL_COMPONENTS.videoFile,
      media: b.mediaId != null && b.mediaId > 0 ? b.mediaId : null,
    };
  });
}

export function newBlockKey(): string {
  return `nb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Serializable pieces for customer-facing tutorial pages (after entitlement check). */
export type TutorialPublicPiece =
  | { type: "richtext"; html: string }
  | { type: "image"; url: string }
  | { type: "videoFile"; url: string }
  | { type: "embed"; url: string };

function pickMediaUrl(data: unknown, origin: string): string | null {
  if (!data || typeof data !== "object") return null;
  const asRecord = data as Record<string, unknown>;
  const flatUrl = asRecord.url;
  if (typeof flatUrl === "string" && flatUrl.length) {
    if (flatUrl.startsWith("http://") || flatUrl.startsWith("https://")) return flatUrl;
    const base = origin.replace(/\/$/, "");
    return `${base}${flatUrl.startsWith("/") ? flatUrl : `/${flatUrl}`}`;
  }
  const attrs = (data as { attributes?: Record<string, unknown> }).attributes;
  if (!attrs) return null;
  const formats = attrs.formats as Record<string, { url?: string }> | undefined;
  const fromFormats =
    formats?.small?.url || formats?.thumbnail?.url || formats?.medium?.url;
  const direct = attrs.url as string | undefined;
  const rel = fromFormats || direct || null;
  if (!rel) return null;
  if (rel.startsWith("http://") || rel.startsWith("https://")) return rel;
  const base = origin.replace(/\/$/, "");
  return `${base}${rel.startsWith("/") ? rel : `/${rel}`}`;
}

/** Map populated Strapi `blocks` to public render model. */
export function blocksToPublicPieces(blocks: unknown, strapiOrigin: string): TutorialPublicPiece[] {
  if (!Array.isArray(blocks)) return [];
  const out: TutorialPublicPiece[] = [];
  for (const raw of blocks) {
    if (!raw || typeof raw !== "object") continue;
    const b = raw as Record<string, unknown>;
    const comp = b.__component as string;
    if (comp === TUTORIAL_COMPONENTS.richText) {
      const html = typeof b.body === "string" ? b.body : "";
      if (html.trim()) out.push({ type: "richtext", html });
      continue;
    }
    if (comp === TUTORIAL_COMPONENTS.media) {
      const file = b.file as { data?: unknown } | Record<string, unknown> | undefined;
      let url: string | null = null;
      if (file && typeof file === "object" && "data" in file) {
        url = pickMediaUrl((file as { data?: unknown }).data, strapiOrigin);
      }
      if (!url && file && typeof file === "object") {
        url = pickMediaUrl(file, strapiOrigin);
      }
      if (url) out.push({ type: "image", url });
      continue;
    }
    if (comp === TUTORIAL_COMPONENTS.videoEmbed) {
      const url = typeof b.url === "string" ? b.url.trim() : "";
      if (url) out.push({ type: "embed", url });
      continue;
    }
    if (comp === TUTORIAL_COMPONENTS.videoFile) {
      const media = b.media as { data?: unknown } | Record<string, unknown> | undefined;
      let url: string | null = null;
      if (media && typeof media === "object" && "data" in media) {
        url = pickMediaUrl((media as { data?: unknown }).data, strapiOrigin);
      }
      if (!url && media && typeof media === "object") {
        url = pickMediaUrl(media, strapiOrigin);
      }
      if (url) out.push({ type: "videoFile", url });
    }
  }
  return out;
}
