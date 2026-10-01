import AnalyticsClient from "./AnalyticsClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen reads={[]}>
      <AnalyticsClient />
    </AdminScreen>
  );
}
