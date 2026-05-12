import AdminCategoryClient, {
  type CategoryRow,
} from "components/specific_elements/portal/admin-category-client";
import { adminStrapiAuthHeaders } from "lib/admin-strapi";
import { fetchStrapiCollection } from "lib/strapi-server-fetch";
import { categoryCoverImageUrl } from "lib/strapi-media";

async function getCategories() {
  const base = process.env.NEXT_PUBLIC_BASE_API_URL_SERVER || "";
  const headers = await adminStrapiAuthHeaders();
  return fetchStrapiCollection(
    `${base}/api/categories?pagination[pageSize]=200&sort=name:asc&populate[cover]=true`,
    { headers }
  );
}

function mapCategories(raw: any[]): CategoryRow[] {
  return raw.map((c) => ({
    id: c.id,
    name: c.attributes?.name ?? "",
    slug: c.attributes?.slug ?? "",
    description: c.attributes?.description ?? "",
    imageUrl: categoryCoverImageUrl(c.attributes),
  }));
}

export default async function AdminCategoriesPage() {
  const raw = await getCategories();
  const categories = mapCategories(raw);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Categories</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Used by blog posts and products. After changing slugs, check links on the public site.
        </p>
      </header>
      <AdminCategoryClient categories={categories} />
    </div>
  );
}
