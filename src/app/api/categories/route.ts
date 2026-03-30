import { NextRequest, NextResponse } from "next/server";
import { strapiServerBaseUrl } from "lib/strapi-server-fetch";

/** Public proxy for blog / UI that uses CategoryService against /api/categories. */
export async function GET(req: NextRequest) {
  const base = strapiServerBaseUrl();
  if (!base) {
    return NextResponse.json({ error: "Strapi URL is not configured" }, { status: 500 });
  }
  const search = req.nextUrl.search;
  const url = `${base}/api/categories${search}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Upstream returned non-JSON", status: res.status },
        { status: 502 }
      );
    }
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to reach Strapi" }, { status: 502 });
  }
}
