import AdminBlogClient, {
  type ArticleRow,
  type CategoryOption,
} from "components/specific_elements/portal/admin-blog-client";
import { adminStrapiAuthHeaders } from "lib/admin-strapi";
import { fetchStrapiCollection } from "lib/strapi-server-fetch";
import { categoryCoverImageUrl } from "lib/strapi-media";

async function getArticles() {
  const base = process.env.NEXT_PUBLIC_BASE_API_URL_SERVER || "";
  const headers = await adminStrapiAuthHeaders();
  return fetchStrapiCollection(
    `${base}/api/articles?sort=updatedAt:desc&pagination[pageSize]=50&populate[cover]=true&populate[category]=true&populate[blocks][populate]=*`,
    { headers }
  );
}

async function getCategories() {
  const base = process.env.NEXT_PUBLIC_BASE_API_URL_SERVER || "";
  const headers = await adminStrapiAuthHeaders();
  return fetchStrapiCollection(
    `${base}/api/categories?pagination[pageSize]=200&sort=name:asc`,
    { headers }
  );
}

function mapArticles(raw: any[]): ArticleRow[] {
  return raw.map((a) => {
    const blocksRaw = a.attributes?.blocks;
    const blocksSnapshot = Array.isArray(blocksRaw) ? blocksRaw : [];
    return {
      id: a.id,
      title: a.attributes?.title ?? "",
      slug: a.attributes?.slug ?? "",
      description: a.attributes?.description ?? "",
      categoryId: a.attributes?.category?.data?.id ?? null,
      imageUrl: categoryCoverImageUrl(a.attributes),
      blocksSnapshot,
    };
  });
}

function mapCategoryOptions(raw: any[]): CategoryOption[] {
  return raw.map((c) => ({
    id: c.id,
    name: c.attributes?.name ?? `Category ${c.id}`,
  }));
}

export default async function AdminBlogPage() {
  const [articleData, categoryData] = await Promise.all([getArticles(), getCategories()]);
  const articles = mapArticles(articleData);
  const categories = mapCategoryOptions(categoryData);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Blog publishing</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Create and edit blog posts from here. If saves fail with a session error, sign out and sign
          in again to refresh your access.
        </p>
      </header>
      <AdminBlogClient articles={articles} categories={categories} />
    </div>
  );
}
