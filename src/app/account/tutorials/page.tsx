import AccountTutorialsListClient from "components/specific_elements/account/account-tutorials-list-client";
import { cookies } from "next/headers";
import { STRAPI_JWT_COOKIE } from "config/constant";
import type { AccountTutorialListRow } from "lib/account-portal-types";
import { listCustomerTutorials } from "lib/product-tutorial-customer";

export default async function AccountTutorialsPage() {
  const jwt = cookies().get(STRAPI_JWT_COOKIE)?.value;
  const items = jwt ? await listCustomerTutorials(jwt) : [];
  const rows: AccountTutorialListRow[] = items.map((i) => ({
    slug: i.slug,
    title: i.title,
  }));

  return (
    <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">My tutorials</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Step-by-step content for products from qualifying orders (paid or in fulfillment).
        </p>
      </div>
      <AccountTutorialsListClient signedIn={Boolean(jwt)} rows={rows} />
    </main>
  );
}
