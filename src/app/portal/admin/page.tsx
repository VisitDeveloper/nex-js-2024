import PortalDashboardHome from "components/specific_elements/portal/portal-dashboard-home";
import { fetchAdminShopOpsMetrics } from "lib/shop-ops-metrics";

export default async function AdminPortalPage() {
  const { metrics, error } = await fetchAdminShopOpsMetrics();
  return <PortalDashboardHome metrics={metrics} metricsError={error} />;
}
