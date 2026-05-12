import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { STRAPI_JWT_COOKIE } from "config/constant";
import { getCustomerTutorialBySlug } from "lib/product-tutorial-customer";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const jwt = cookies().get(STRAPI_JWT_COOKIE)?.value;
  if (!jwt) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const slug = params.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const result = await getCustomerTutorialBySlug(jwt, slug);
  if (!result.ok) {
    if (result.reason === "forbidden") {
      return NextResponse.json({ error: "You do not have access to this tutorial" }, { status: 403 });
    }
    return NextResponse.json({ error: "Product or tutorial not found" }, { status: 404 });
  }

  return NextResponse.json(result.data);
}
