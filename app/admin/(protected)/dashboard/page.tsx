import DashboardClient from "./DashboardClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen preview>
      <DashboardClient />
    </AdminScreen>
  );
}
