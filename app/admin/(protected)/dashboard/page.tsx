import DashboardClient from "./DashboardClient";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default function Page() {
  return (
    <AdminScreen
      preview
      reads={["dashboard", "inquiries", "testimonials", "removal", "people", "services", "galleries", "pages", "push"]}
    >
      <DashboardClient />
    </AdminScreen>
  );
}
