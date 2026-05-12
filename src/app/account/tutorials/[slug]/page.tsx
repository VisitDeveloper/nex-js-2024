import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { STRAPI_JWT_COOKIE } from "config/constant";
import { getCustomerTutorialBySlug } from "lib/product-tutorial-customer";
import ProductTutorialView from "components/account/product-tutorial-view";

export default async function AccountTutorialDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const jwt = cookies().get(STRAPI_JWT_COOKIE)?.value;
  if (!jwt) {
    return (
      <main className="max-w-7xl mx-auto w-full space-y-4">
        <h1 className="text-2xl font-bold">Tutorial</h1>
        <p className="text-sm text-gray-600">Sign in to view this content.</p>
        <Link className="text-sm font-medium text-emerald-700 underline" href="/auth">
          Sign in
        </Link>
      </main>
    );
  }

  const slug = params.slug?.trim();
  if (!slug) notFound();

  const result = await getCustomerTutorialBySlug(jwt, slug);
  if (!result.ok) {
    if (result.reason === "forbidden") {
      return (
        <main className="max-w-7xl mx-auto w-full space-y-4">
          <h1 className="text-2xl font-bold">Access restricted</h1>
          <p className="text-sm text-gray-600">
            This tutorial is available after you purchase the product on a qualifying order.
          </p>
          <Link className="text-sm text-emerald-700 underline" href="/shop">
            Browse shop
          </Link>
        </main>
      );
    }
    notFound();
  }

  return (
    <main className="max-w-7xl mx-auto w-full space-y-6">
      <nav className="text-sm text-zinc-500">
        <Link href="/account/tutorials" className="text-emerald-700 hover:underline">
          My tutorials
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-800">{result.data.title}</span>
      </nav>
      <ProductTutorialView title={result.data.title} pieces={result.data.pieces} />
    </main>
  );
}
