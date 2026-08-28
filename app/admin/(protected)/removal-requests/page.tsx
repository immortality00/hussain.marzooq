import RemovalRequestsClient from "./RemovalRequestsClient";
import { getRemovalRequestHistory, getRemovalRequestQueue } from "@/lib/server/removal-requests";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminRemovalRequestsPage() {
  const [items, history] = await Promise.all([
    getRemovalRequestQueue(),
    getRemovalRequestHistory(),
  ]);
  return <RemovalRequestsClient items={items} history={history} />;
}
