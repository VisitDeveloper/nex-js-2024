import AdminCustomersClient from "components/specific_elements/portal/admin-customers-client";
import { loadAdminCustomersData } from "lib/admin-customers-data";

export default async function AdminUsersPage() {
  const { rows, kpis } = await loadAdminCustomersData();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">User management</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Retail customer view — orders, spend, and quick actions. Open a row for the full profile.
        </p>
      </header>
      <AdminCustomersClient rows={rows} kpis={kpis} />
    </div>
  );
}
