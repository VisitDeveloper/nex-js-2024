/**
 * Strapi article `blocks` dynamic zone helpers (shared.rich-text body).
 * Other components (shared.quote, shared.media, …) stay in order when editing body here.
 */

export type ArticleBlockEntry = Record<string, unknown> & {
  __component?: string;
  id?: number;
};

function extractStrapiSingleMediaId(file: unknown): number | null {
  if (typeof file === "number" && Number.isFinite(file)) return file;
  if (file && typeof file === "object") {
    const f = file as Record<string, unknown>;
    if (typeof f.id === "number") return f.id;
    const d = f.data as Record<string, unknown> | null | undefined;
    if (d && typeof d.id === "number") return d.id;
  }
  return null;
}

function extractStrapiMultiMediaIds(files: unknown): number[] {
  if (Array.isArray(files) && files.every((x) => typeof x === "number")) {
    return files as number[];
  }
  if (files && typeof files === "object") {
    const o = files as Record<string, unknown>;
    const data = o.data;
    if (Array.isArray(data)) {
      return data
        .map((item) => {
          if (item && typeof item === "object" && typeof (item as { id?: unknown }).id === "number") {
            return (item as { id: number }).id;
          }
          return null;
        })
        .filter((x): x is number => x != null);
    }
  }
  return [];
}

export function extractRichTextBody(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  const rich = blocks.find(
    (b): b is ArticleBlockEntry =>
      typeof b === "object" &&
      b !== null &&
      (b as ArticleBlockEntry).__component === "shared.rich-text"
  );
  const body = rich?.body;
  return typeof body === "string" ? body : "";
}

export function upsertRichTextBlock(blocks: unknown, newBody: string): ArticleBlockEntry[] {
  const list: ArticleBlockEntry[] = Array.isArray(blocks)
    ? blocks.map((b) =>
        typeof b === "object" && b !== null ? { ...(b as ArticleBlockEntry) } : ({} as ArticleBlockEntry)
      )
    : [];
  const idx = list.findIndex((b) => b.__component === "shared.rich-text");
  const trimmed = newBody.trim();

  if (trimmed) {
    const comp: ArticleBlockEntry =
      idx >= 0
        ? { ...list[idx], __component: "shared.rich-text", body: trimmed }
        : { __component: "shared.rich-text", body: trimmed };
    if (idx >= 0) {
      list[idx] = comp;
    } else {
      list.push(comp);
    }
  } else if (idx >= 0) {
    list.splice(idx, 1);
  }

  return list;
}

/** Flatten Strapi REST populate shape into ids we can edit and re-send. */
export function normalizeArticleBlocksFromApi(blocks: unknown): ArticleBlockEntry[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((raw) => normalizeOneBlockFromApi(raw)).filter((b) => typeof b.__component === "string");
}

function normalizeOneBlockFromApi(raw: unknown): ArticleBlockEntry {
  if (!raw || typeof raw !== "object") return {};
  const src = raw as ArticleBlockEntry;
  const c = src.__component;
  if (!c || typeof c !== "string") return {};

  if (c === "shared.rich-text") {
    return {
      __component: c,
      ...(typeof src.id === "number" ? { id: src.id } : {}),
      body: typeof src.body === "string" ? src.body : "",
    };
  }
  if (c === "shared.quote") {
    return {
      __component: c,
      ...(typeof src.id === "number" ? { id: src.id } : {}),
      title: typeof src.title === "string" ? src.title : "",
      body: typeof src.body === "string" ? src.body : "",
      author: typeof src.author === "string" ? src.author : "",
    };
  }
  if (c === "shared.video-embed") {
    return {
      __component: c,
      ...(typeof src.id === "number" ? { id: src.id } : {}),
      url: typeof src.url === "string" ? src.url : "",
    };
  }
  if (c === "shared.media") {
    const fileId = extractStrapiSingleMediaId(src.file);
    return {
      __component: c,
      ...(typeof src.id === "number" ? { id: src.id } : {}),
      file: fileId,
    };
  }
  if (c === "shared.slider") {
    const ids = extractStrapiMultiMediaIds(src.files);
    return {
      __component: c,
      ...(typeof src.id === "number" ? { id: src.id } : {}),
      files: ids,
    };
  }
  return { ...src };
}

/**
 * Shape expected by Strapi REST for dynamic zone components (flat media ids, no nested populate).
 * @param preserveComponentIds use true on article update so Strapi updates existing component rows.
 */
export function sanitizeArticleBlocksForStrapi(
  blocks: unknown,
  options: { preserveComponentIds?: boolean } = {}
): Record<string, unknown>[] {
  const preserve = options.preserveComponentIds === true;
  if (!Array.isArray(blocks)) return [];
  return blocks.map((raw) => sanitizeOneBlockForStrapi(raw, preserve));
}

function sanitizeOneBlockForStrapi(raw: unknown, preserveId: boolean): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  const src = raw as ArticleBlockEntry;
  const c = src.__component;
  if (!c || typeof c !== "string") return {};

  const out: Record<string, unknown> = { __component: c };
  if (preserveId && typeof src.id === "number") out.id = src.id;

  if (c === "shared.rich-text") {
    out.body = typeof src.body === "string" ? src.body : "";
    return out;
  }
  if (c === "shared.quote") {
    out.title = typeof src.title === "string" ? src.title : "";
    out.body = typeof src.body === "string" ? src.body : "";
    out.author = typeof src.author === "string" ? src.author : "";
    return out;
  }
  if (c === "shared.video-embed") {
    out.url = typeof src.url === "string" ? src.url : "";
    return out;
  }
  if (c === "shared.media") {
    const id = extractStrapiSingleMediaId(src.file);
    out.file = id != null ? id : null;
    return out;
  }
  if (c === "shared.slider") {
    out.files = extractStrapiMultiMediaIds(src.files);
    return out;
  }

  const rest = { ...src } as Record<string, unknown>;
  delete rest.id;
  delete rest.createdAt;
  delete rest.updatedAt;
  return rest;
}
